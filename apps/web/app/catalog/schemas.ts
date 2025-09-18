import { z } from "zod";

const optionalTrimmed = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined));

export const createProductSchema = z.object({
  sku: z
    .string({ required_error: "SKU is required" })
    .trim()
    .min(3, "Use at least 3 characters")
    .max(32, "Keep SKU under 32 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Only letters, numbers, dash and underscore")
    .transform((value) => value.toUpperCase()),
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, "Name is too short")
    .max(120, "Keep the name concise"),
  description: optionalTrimmed.optional(),
  basePrice: z
    .coerce
    .number({ invalid_type_error: "Enter a price" })
    .refine((value) => Number.isFinite(value), "Enter a valid number")
    .refine((value) => value >= 0, "Price cannot be negative"),
  unit: optionalTrimmed.max(16, "Unit is too long").optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string({ required_error: "Missing product id" }).cuid("Invalid product id"),
});

export const deleteProductSchema = z.object({
  id: z.string({ required_error: "Missing product id" }).cuid("Invalid id"),
});

export const addTierPriceSchema = z.object({
  productId: z.string({ required_error: "Missing product" }).cuid("Invalid product id"),
  tierId: z.string({ required_error: "Select a tier" }).cuid("Invalid tier id"),
  price: z
    .coerce
    .number({ invalid_type_error: "Enter a price" })
    .refine((value) => Number.isFinite(value) && value >= 0, "Enter a valid price"),
});

export const deleteTierPriceSchema = z.object({
  priceId: z.string({ required_error: "Missing price id" }).cuid("Invalid id"),
});
