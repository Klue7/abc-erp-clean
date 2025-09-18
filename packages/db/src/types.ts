// Central re-exports for Prisma model types to be consumed by workspace apps
import type { User, Customer, CustomerTier, Product, ProductPrice } from "@prisma/client";
export type { User, Customer, CustomerTier, Product, ProductPrice };

// convenience composite types
export type ProductWithPrices = Product & { prices: (ProductPrice & { tier: CustomerTier })[] };
