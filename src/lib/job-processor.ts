import { prisma } from "@/lib/prisma";
import { extractInterests } from "@/lib/interest-extractor";
import { generateGifts } from "@/lib/gift-recommender";
import type { ResearchJobModel } from "@/generated/prisma/models/ResearchJob";
import type { ContactModel } from "@/generated/prisma/models/Contact";
import type { AccountModel } from "@/generated/prisma/models/Account";
import type { SocialProfileModel } from "@/generated/prisma/models/SocialProfile";

type JobWithContext = ResearchJobModel & {
  contact: ContactModel & {
    account: AccountModel;
    profiles: SocialProfileModel[];
  };
};

// ── Individual job handlers ────────────────────────────────────────────────

async function handleProfileResearch(job: JobWithContext): Promise<void> {
  // In production this would trigger real LinkedIn / Instagram scraping.
  // Here we verify that rawText is already present on the social profiles
  // (seeded data) and record a simulated scrape timestamp.
  const profiles = job.contact.profiles;
  if (profiles.length === 0) {
    throw new Error(
      `Contact ${job.contactId} has no social profiles to research.`
    );
  }
  // Mark all profiles as "scraped now" if they haven't been already
  await prisma.socialProfile.updateMany({
    where: {
      contactId: job.contactId,
      lastScrapedAt: null,
    },
    data: { lastScrapedAt: new Date() },
  });
}

async function handleInterestExtraction(job: JobWithContext): Promise<void> {
  const profiles = job.contact.profiles.map((p: SocialProfileModel) => ({
    rawText: p.rawText,
    url: p.url,
  }));

  const interests = extractInterests(job.contactId, profiles);

  if (interests.length > 0) {
    // Remove old interests before inserting fresh ones (idempotent re-runs)
    await prisma.contactInterest.deleteMany({
      where: { contactId: job.contactId },
    });
    await prisma.contactInterest.createMany({ data: interests });
  }
}

// Statuses that mean a contact already has a committed gift — skip generation.
const ACTIVE_GIFT_STATUSES = ["APPROVED", "ORDERED", "SENT", "DELIVERED"] as const;

async function handleGiftGeneration(job: JobWithContext): Promise<void> {
  // Idempotency guard: skip if the contact already has an active gift.
  // This prevents overwriting a committed approval when re-researching.
  const activeGift = await prisma.giftRecommendation.findFirst({
    where: {
      contactId: job.contactId,
      status: { in: [...ACTIVE_GIFT_STATUSES] },
    },
    select: { id: true, status: true },
  });

  if (activeGift) {
    console.log(
      `[processor] Contact ${job.contactId} already has an active gift (${activeGift.status}), skipping gift generation.`
    );
    await prisma.contact.update({
      where: { id: job.contactId },
      data: { status: "COMPLETED" },
    });
    return;
  }

  const interests = await prisma.contactInterest.findMany({
    where: { contactId: job.contactId },
  });

  const tier = job.contact.account.tier;
  const gifts = generateGifts(job.contactId, interests, tier);

  if (gifts.length > 0) {
    // Remove only DRAFT recommendations before inserting fresh ones.
    // SUPERSEDED/REJECTED gifts are kept for audit trail.
    await prisma.giftRecommendation.deleteMany({
      where: { contactId: job.contactId, status: "DRAFT" },
    });
    await prisma.giftRecommendation.createMany({ data: gifts });
  }

  // Mark the contact as fully researched
  await prisma.contact.update({
    where: { id: job.contactId },
    data: { status: "COMPLETED" },
  });
}

// ── Chain helper ───────────────────────────────────────────────────────────

function nextJobType(
  current: "PROFILE_RESEARCH" | "INTEREST_EXTRACTION" | "GIFT_GENERATION"
): "INTEREST_EXTRACTION" | "GIFT_GENERATION" | null {
  if (current === "PROFILE_RESEARCH") return "INTEREST_EXTRACTION";
  if (current === "INTEREST_EXTRACTION") return "GIFT_GENERATION";
  return null;
}

// ── Core processor ─────────────────────────────────────────────────────────

/**
 * Processes a single ResearchJob by ID.
 * Transitions: PENDING → RUNNING → COMPLETED | FAILED
 * On success, creates the next chained job (INTEREST_EXTRACTION or GIFT_GENERATION).
 */
export async function processJob(jobId: string): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
    include: {
      contact: {
        include: {
          account: true,
          profiles: true,
        },
      },
    },
  });

  if (!job) throw new Error(`Job ${jobId} not found.`);
  if (job.status !== "PENDING") {
    console.log(`[processor] Job ${jobId} is ${job.status}, skipping.`);
    return;
  }

  // Mark as running
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  try {
    switch (job.jobType) {
      case "PROFILE_RESEARCH":
        await handleProfileResearch(job as JobWithContext);
        break;
      case "INTEREST_EXTRACTION":
        await handleInterestExtraction(job as JobWithContext);
        break;
      case "GIFT_GENERATION":
        await handleGiftGeneration(job as JobWithContext);
        break;
    }

    // Mark as completed
    await prisma.researchJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    // Create the next job in the pipeline chain
    const next = nextJobType(job.jobType);
    if (next) {
      await prisma.researchJob.create({
        data: {
          contactId: job.contactId,
          jobType: next,
          status: "PENDING",
        },
      });
    }
  } catch (err) {
    await prisma.researchJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    // Re-throw so the caller (worker or API route) knows it failed
    throw err;
  }
}

// ── Convenience helper for the API route ──────────────────────────────────

/**
 * Creates a PROFILE_RESEARCH job and synchronously processes all three
 * pipeline stages (PROFILE_RESEARCH → INTEREST_EXTRACTION → GIFT_GENERATION).
 *
 * Used by the API route when ?immediate=true (the default) so the demo
 * shows results without needing the background worker running.
 *
 * The background worker uses processJob() directly and achieves the same
 * result asynchronously by polling PENDING jobs.
 */
export async function processContactPipeline(contactId: string): Promise<void> {
  // Check contact exists
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) throw new Error(`Contact ${contactId} not found.`);

  // Mark contact as in-progress
  await prisma.contact.update({
    where: { id: contactId },
    data: { status: "IN_PROGRESS" },
  });

  // Stage 1
  const job1 = await prisma.researchJob.create({
    data: { contactId, jobType: "PROFILE_RESEARCH", status: "PENDING" },
  });
  await processJob(job1.id);

  // Stage 2 — created by processJob above
  const job2 = await prisma.researchJob.findFirst({
    where: { contactId, jobType: "INTEREST_EXTRACTION", status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (job2) await processJob(job2.id);

  // Stage 3 — created by processJob above
  const job3 = await prisma.researchJob.findFirst({
    where: { contactId, jobType: "GIFT_GENERATION", status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (job3) await processJob(job3.id);
}
