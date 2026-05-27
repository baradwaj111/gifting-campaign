import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PatchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ORDERED", "SENT", "DELIVERED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const newStatus = parsed.data.status;

    // When approving, run as a transaction:
    // 1. Update the selected gift to APPROVED
    // 2. Supersede all other DRAFT gifts for the same contact
    if (newStatus === "APPROVED") {
      const [gift] = await prisma.$transaction(async (tx) => {
        // Fetch the gift first to get contactId
        const target = await tx.giftRecommendation.findUnique({
          where: { id },
          select: { id: true, contactId: true },
        });
        if (!target) throw Object.assign(new Error("Not found"), { code: "P2025" });

        // Approve the selected gift
        const updated = await tx.giftRecommendation.update({
          where: { id },
          data: { status: "APPROVED" },
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                account: { select: { name: true } },
              },
            },
          },
        });

        // Mark all other DRAFT gifts for this contact as SUPERSEDED
        await tx.giftRecommendation.updateMany({
          where: {
            contactId: target.contactId,
            status: "DRAFT",
            id: { not: id },
          },
          data: { status: "SUPERSEDED" },
        });

        return [updated];
      });

      return Response.json({ data: gift });
    }

    // For all other status transitions, update directly
    const gift = await prisma.giftRecommendation.update({
      where: { id },
      data: { status: newStatus },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            account: { select: { name: true } },
          },
        },
      },
    });

    return Response.json({ data: gift });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return Response.json({ error: "Gift not found." }, { status: 404 });
    }
    console.error(`[PATCH /api/gifts/${id}]`, err);
    return Response.json({ error: "Failed to update gift." }, { status: 500 });
  }
}
