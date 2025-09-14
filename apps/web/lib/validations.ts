import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  tier: z.enum(["basic", "premium", "enterprise"]).default("basic"),
});

export const customerQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(100).default(10),
});

export type CustomerInput = z.infer<typeof customerSchema>;
