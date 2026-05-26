// This file is read by the Prisma CLI only (migrations, studio, seed).
// The runtime PrismaClient uses @prisma/adapter-pg and reads DATABASE_URL
// directly — see src/lib/prisma.ts.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 reads the seed command from here, not from package.json.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
