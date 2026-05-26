import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const status = sp.get("status") ?? undefined;
  const category = sp.get("category") ?? undefined;
  const giftType = sp.get("giftType") ?? undefined;
  const contactId = sp.get("contactId") ?? undefined;
  const minBudget = sp.get("minBudget") ? Number(sp.get("minBudget")) : undefined;
  const maxBudget = sp.get("maxBudget") ? Number(sp.get("maxBudget")) : undefined;

  try {
    const gifts = await prisma.giftRecommendation.findMany({
      where: {
        ...(status && { status: status as never }),
        ...(category && { category: category as never }),
        ...(giftType && { giftType: giftType as never }),
        ...(contactId && { contactId }),
        ...(minBudget !== undefined || maxBudget !== undefined
          ? {
              estimatedCost: {
                ...(minBudget !== undefined && { gte: minBudget }),
                ...(maxBudget !== undefined && { lte: maxBudget }),
              },
            }
          : {}),
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            account: { select: { id: true, name: true, tier: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: gifts, total: gifts.length });
  } catch (err) {
    console.error("[GET /api/gifts]", err);
    return Response.json({ error: "Failed to fetch gifts." }, { status: 500 });
  }
}
