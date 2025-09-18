import type {
  PrismaClient,
  Prisma,
  User,
  Customer,
  CustomerTier,
  Product,
  ProductPrice,
} from "@prisma/client";

declare module "@abc/db" {
  const prisma: PrismaClient;
  export { prisma };
  export default prisma;

  export { Prisma };
  export type { PrismaClient, User, Customer, CustomerTier, Product, ProductPrice };
}
