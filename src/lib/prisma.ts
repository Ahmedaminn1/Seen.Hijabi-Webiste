/**
 * Prisma singleton for Next.js.
 *
 * NOTE: This file will only compile after you have:
 * 1. Defined models in prisma/schema.prisma (done in Phase 2)
 * 2. Run `npm run db:generate` (or `npx prisma generate`)
 *
 * The generated client is placed at `src/generated/prisma` as configured
 * in the schema's generator block.
 *
 * In development, Next.js hot-reload creates new module instances on every
 * change. Without this singleton pattern, each reload would create a new
 * PrismaClient and exhaust the database connection pool quickly.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaInstance: any;

function getPrismaClient() {
  if (prismaInstance) return prismaInstance;

  // Dynamic require so this file doesn't break before `prisma generate` runs.
  // Once Phase 2 schema is in place and generate has run, replace this with:
  //   import { PrismaClient } from "@/generated/prisma"
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");

  prismaInstance = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

  return prismaInstance;
}

export const prisma = getPrismaClient();
