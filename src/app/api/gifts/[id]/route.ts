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
    const gift = await prisma.giftRecommendation.update({
      where: { id },
      data: { status: parsed.data.status },
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
    // Prisma record-not-found throws a specific error code
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
