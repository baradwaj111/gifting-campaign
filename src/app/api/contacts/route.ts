import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const tier = sp.get("tier") ?? undefined;
  const status = sp.get("status") ?? undefined;
  const city = sp.get("city") ?? undefined;
  const interestCategory = sp.get("interestCategory") ?? undefined;
  const minAcv = sp.get("minAcv") ? Number(sp.get("minAcv")) : undefined;
  const maxAcv = sp.get("maxAcv") ? Number(sp.get("maxAcv")) : undefined;

  try {
    const contacts = await prisma.contact.findMany({
      where: {
        ...(status && { status: status as never }),
        ...(city && {
          city: { contains: city, mode: "insensitive" },
        }),
        ...(interestCategory && {
          interests: { some: { category: interestCategory as never } },
        }),
        account: {
          ...(tier && { tier: tier as never }),
          ...(minAcv !== undefined || maxAcv !== undefined
            ? {
                expectedAcv: {
                  ...(minAcv !== undefined && { gte: minAcv }),
                  ...(maxAcv !== undefined && { lte: maxAcv }),
                },
              }
            : {}),
        },
      },
      include: {
        account: true,
        interests: { orderBy: { confidence: "desc" } },
        _count: {
          select: {
            recommendations: true,
            researchJobs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: contacts, total: contacts.length });
  } catch (err) {
    console.error("[GET /api/contacts]", err);
    return Response.json({ error: "Failed to fetch contacts." }, { status: 500 });
  }
}
