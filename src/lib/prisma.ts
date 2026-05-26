import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 with the new `prisma-client` generator requires a driver adapter.
// `datasourceUrl` is not a valid constructor option — the URL is passed to
// the adapter, which is then passed to PrismaClient via `{ adapter }`.
// Next.js loads .env automatically, so DATABASE_URL is available here.
function makePrisma() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
