import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { processContactPipeline } from "@/lib/job-processor";

/**
 * POST /api/contacts/:id/research
 *
 * Triggers the three-stage research pipeline for a contact:
 *   PROFILE_RESEARCH → INTEREST_EXTRACTION → GIFT_GENERATION
 *
 * Query params:
 *   ?immediate=true  (default) — runs all three stages synchronously and
 *                                returns the updated contact in the response.
 *                                Convenient for demos and UI interactions.
 *
 *   ?immediate=false           — creates only the PROFILE_RESEARCH job
 *                                (status: PENDING) and returns 202 Accepted.
 *                                The background worker (`npm run worker`)
 *                                picks it up and chains the remaining stages.
 *
 * The DB-backed job records are created and their status transitions are
 * persisted in both modes — the difference is only in who processes them.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const immediate = request.nextUrl.searchParams.get("immediate") !== "false";

  try {
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { profiles: true },
    });

    if (!contact) {
      return Response.json({ error: "Contact not found." }, { status: 404 });
    }

    if (contact.profiles.length === 0) {
      return Response.json(
        { error: "Contact has no social profiles to research." },
        { status: 422 }
      );
    }

    // Prevent duplicate pipelines while one is already running
    const activeJob = await prisma.researchJob.findFirst({
      where: {
        contactId: id,
        status: { in: ["PENDING", "RUNNING"] },
      },
    });
    if (activeJob) {
      return Response.json(
        {
          error: "A research pipeline is already active for this contact.",
          jobId: activeJob.id,
          jobStatus: activeJob.status,
        },
        { status: 409 }
      );
    }

    if (immediate) {
      // Run synchronously — all three stages complete before we respond.
      await processContactPipeline(id);

      const updated = await prisma.contact.findUnique({
        where: { id },
        include: {
          account: true,
          profiles: true,
          interests: { orderBy: { confidence: "desc" } },
          researchJobs: { orderBy: { createdAt: "asc" } },
          recommendations: { orderBy: { estimatedCost: "desc" } },
        },
      });

      return Response.json({ data: updated }, { status: 200 });
    } else {
      // Async mode — create the first job and let the worker handle it.
      const job = await prisma.researchJob.create({
        data: {
          contactId: id,
          jobType: "PROFILE_RESEARCH",
          status: "PENDING",
        },
      });

      await prisma.contact.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });

      return Response.json(
        {
          message:
            "Research job queued. Start `npm run worker` to process it.",
          jobId: job.id,
        },
        { status: 202 }
      );
    }
  } catch (err) {
    console.error(`[POST /api/contacts/${id}/research]`, err);
    return Response.json(
      { error: "Failed to trigger research pipeline." },
      { status: 500 }
    );
  }
}
