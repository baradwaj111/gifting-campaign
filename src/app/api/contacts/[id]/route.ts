import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        account: true,
        profiles: { orderBy: { createdAt: "asc" } },
        interests: { orderBy: { confidence: "desc" } },
        researchJobs: { orderBy: { createdAt: "desc" } },
        recommendations: {
          orderBy: { estimatedCost: "desc" },
        },
      },
    });

    if (!contact) {
      return Response.json({ error: "Contact not found." }, { status: 404 });
    }

    return Response.json({ data: contact });
  } catch (err) {
    console.error(`[GET /api/contacts/${id}]`, err);
    return Response.json({ error: "Failed to fetch contact." }, { status: 500 });
  }
}
