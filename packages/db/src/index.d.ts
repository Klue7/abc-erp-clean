export { PrismaClient, Prisma } from "@prisma/client";
export type { User, Customer, CustomerTier, Product, ProductPrice } from "@prisma/client";
export * as types from "@prisma/client";
export * from "./types";
import prisma from "./client";
export { prisma };
export default prisma;
