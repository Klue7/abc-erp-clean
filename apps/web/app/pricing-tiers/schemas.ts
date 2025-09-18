import { z } from "zod";

export const createTierSchema = z.object({
  code: z
    .string({ required_error: "Code is required" })
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Keep codes under 20 characters")
    .regex(/^[a-z0-9_-]+$/i, "Only letters, numbers, dash and underscore")
    .transform((value) => value.toUpperCase()),
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name is too short")
    .max(80, "Keep the name concise"),
  description: z
    .string()
    .trim()
    .max(160, "Description is too long")
    .optional()
    .transform((value) => (value ? value : undefined)),
  discountPercent: z
    .coerce
    .number({ invalid_type_error: "Enter a number" })
    .refine((value) => Number.isFinite(value), "Enter a valid number")
    .refine((value) => value >= 0 && value <= 100, "Use a percentage between 0 and 100"),
  active: z.boolean(),
});

export const deleteTierSchema = z.object({
  id: z.string({ required_error: "Missing id" }).cuid("Invalid tier id"),
});
