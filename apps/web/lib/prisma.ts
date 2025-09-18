// Re-export the shared Prisma client from the central package.
// Using the package name `@abc/db` should be resolved by tsconfig path mapping.
import { prisma as sharedPrisma } from "@abc/db";

export const prisma = sharedPrisma;

