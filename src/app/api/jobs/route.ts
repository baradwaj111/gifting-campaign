import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const status = sp.get("status") ?? undefined;
  const jobType = sp.get("jobType") ?? undefined;
  const contactId = sp.get("contactId") ?? undefined;

  try {
    const jobs = await prisma.researchJob.findMany({
      where: {
        ...(status && { status: status as never }),
        ...(jobType && { jobType: jobType as never }),
        ...(contactId && { contactId }),
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            account: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: jobs, total: jobs.length });
  } catch (err) {
    console.error("[GET /api/jobs]", err);
    return Response.json({ error: "Failed to fetch jobs." }, { status: 500 });
  }
}
