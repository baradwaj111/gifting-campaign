-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('STRATEGIC', 'ENTERPRISE', 'MID_MARKET');

-- CreateEnum
CREATE TYPE "ContactResearchStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('LINKEDIN', 'INSTAGRAM', 'X', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "ResearchJobType" AS ENUM ('PROFILE_RESEARCH', 'INTEREST_EXTRACTION', 'GIFT_GENERATION');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "InterestCategory" AS ENUM ('FITNESS', 'MUSIC', 'SPORTS', 'TRAVEL', 'FAMILY', 'FOOD', 'BOOKS', 'TECH', 'GAMING', 'ART', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "GiftCategory" AS ENUM ('SUBSCRIPTION', 'EVENT', 'MERCHANDISE', 'EXPERIENCE', 'PHYSICAL_PRODUCT', 'CHARITY', 'GIFT_CARD');

-- CreateEnum
CREATE TYPE "GiftType" AS ENUM ('PHYSICAL', 'VIRTUAL', 'EXPERIENCE');

-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('DRAFT', 'APPROVED', 'ORDERED', 'SENT', 'DELIVERED', 'REJECTED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "industry" TEXT,
    "city" TEXT,
    "country" TEXT,
    "expectedAcv" INTEGER NOT NULL,
    "tier" "AccountTier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "city" TEXT,
    "country" TEXT,
    "seniority" TEXT,
    "status" "ContactResearchStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialProfile" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "url" TEXT NOT NULL,
    "rawText" TEXT,
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchJob" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "jobType" "ResearchJobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInterest" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "category" "InterestCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "evidence" TEXT,
    "sourceUrl" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "detectedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftRecommendation" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "interestId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "GiftCategory" NOT NULL,
    "estimatedCost" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "vendor" TEXT,
    "giftType" "GiftType" NOT NULL,
    "status" "GiftStatus" NOT NULL DEFAULT 'DRAFT',
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_accountId_idx" ON "Contact"("accountId");

-- CreateIndex
CREATE INDEX "Contact_status_idx" ON "Contact"("status");

-- CreateIndex
CREATE INDEX "SocialProfile_contactId_idx" ON "SocialProfile"("contactId");

-- CreateIndex
CREATE INDEX "SocialProfile_platform_idx" ON "SocialProfile"("platform");

-- CreateIndex
CREATE INDEX "ResearchJob_contactId_idx" ON "ResearchJob"("contactId");

-- CreateIndex
CREATE INDEX "ResearchJob_status_idx" ON "ResearchJob"("status");

-- CreateIndex
CREATE INDEX "ResearchJob_jobType_idx" ON "ResearchJob"("jobType");

-- CreateIndex
CREATE INDEX "ContactInterest_contactId_idx" ON "ContactInterest"("contactId");

-- CreateIndex
CREATE INDEX "ContactInterest_category_idx" ON "ContactInterest"("category");

-- CreateIndex
CREATE INDEX "GiftRecommendation_contactId_idx" ON "GiftRecommendation"("contactId");

-- CreateIndex
CREATE INDEX "GiftRecommendation_status_idx" ON "GiftRecommendation"("status");

-- CreateIndex
CREATE INDEX "GiftRecommendation_category_idx" ON "GiftRecommendation"("category");

-- CreateIndex
CREATE INDEX "GiftRecommendation_estimatedCost_idx" ON "GiftRecommendation"("estimatedCost");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProfile" ADD CONSTRAINT "SocialProfile_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchJob" ADD CONSTRAINT "ResearchJob_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInterest" ADD CONSTRAINT "ContactInterest_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftRecommendation" ADD CONSTRAINT "GiftRecommendation_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
