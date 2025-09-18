import prisma from "./client";
export { prisma };

// Re-export commonly used Prisma types for consumers
export type { PrismaClient, Prisma } from "@prisma/client";
export type { User, Customer, CustomerTier, Product, ProductPrice } from "@prisma/client";

// Also provide a `types` namespace for convenience
export * as types from "@prisma/client";

// Re-export package-level types from ./types so consumers can import them from `@abc/db`
export * from "./types";

export default prisma;
