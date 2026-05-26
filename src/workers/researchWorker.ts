/**
 * Research Worker
 *
 * Long-running background process that polls the database every 5 seconds
 * for PENDING ResearchJobs and processes them one at a time.
 *
 * Pipeline chain (automatic via job-processor):
 *   PROFILE_RESEARCH → INTEREST_EXTRACTION → GIFT_GENERATION
 *
 * Usage:
 *   npm run worker
 *   # or directly:
 *   tsx src/workers/researchWorker.ts
 *
 * The worker is intentionally separate from the Next.js server so it can
 * run as an independent process in production (e.g. a Fly.io worker dyno,
 * a Railway worker service, or a simple background task on any VPS).
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { processJob } from "@/lib/job-processor";

const POLL_INTERVAL_MS = 5_000;

// ── Logging helpers ────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] [worker] ${msg}`);
}

function logError(msg: string, err: unknown) {
  console.error(
    `[${new Date().toISOString()}] [worker] ERROR ${msg}:`,
    err instanceof Error ? err.message : err
  );
}

// ── Poll loop ──────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  // Fetch the oldest PENDING job across all contacts
  const job = await prisma.researchJob.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      contact: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!job) return; // Nothing to do this cycle

  const contactName = `${job.contact.firstName} ${job.contact.lastName}`;
  log(`Processing job ${job.id} | type=${job.jobType} | contact="${contactName}"`);

  try {
    await processJob(job.id);
    log(`Completed job ${job.id} | type=${job.jobType}`);
  } catch (err) {
    logError(`Failed job ${job.id} | type=${job.jobType}`, err);
    // Error is already persisted to DB by processJob; keep running.
  }
}

async function run(): Promise<void> {
  log("Starting research worker (poll interval: 5 s)");
  log("Press Ctrl+C to stop.");

  // Graceful shutdown
  process.on("SIGINT", async () => {
    log("Received SIGINT — disconnecting Prisma and shutting down.");
    await prisma.$disconnect();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    log("Received SIGTERM — disconnecting Prisma and shutting down.");
    await prisma.$disconnect();
    process.exit(0);
  });

  // Initial stats on startup
  const [pendingCount, contactCount] = await Promise.all([
    prisma.researchJob.count({ where: { status: "PENDING" } }),
    prisma.contact.count(),
  ]);
  log(`DB connected. Contacts: ${contactCount} | Pending jobs: ${pendingCount}`);

  // Main loop
  while (true) {
    try {
      await poll();
    } catch (err) {
      logError("Unexpected error during poll", err);
    }
    await new Promise<void>((resolve) =>
      setTimeout(resolve, POLL_INTERVAL_MS)
    );
  }
}

run();
