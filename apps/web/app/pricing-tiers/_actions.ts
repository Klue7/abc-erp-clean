"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createTierSchema, deleteTierSchema } from "./schemas";

const checkboxTrueValues = new Set(["true", "1", "on", "yes"]);

export type TierFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialTierFormState: TierFormState = { status: "idle" };

export async function createTierAction(
  _prevState: TierFormState,
  formData: FormData,
): Promise<TierFormState> {
  const rawActive = formData.get("active");
  const toOptionalString = (value: FormDataEntryValue | null) =>
    typeof value === "string" ? value : undefined;
  const parsed = createTierSchema.safeParse({
    code: toOptionalString(formData.get("code")),
    name: toOptionalString(formData.get("name")),
    description: toOptionalString(formData.get("description")),
    discountPercent: toOptionalString(formData.get("discountPercent")),
    active: typeof rawActive === "string"
      ? checkboxTrueValues.has(rawActive.toLowerCase())
      : false,
  });
  if (!parsed.success) {
    const { fieldErrors, formErrors } = parsed.error.flatten();
    return {
      status: "error",
      message: formErrors.join(" ") || "Please fix the highlighted fields",
      fieldErrors,
    };
  }

  try {
    await prisma.customerTier.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description,
        discountPercent: parsed.data.discountPercent,
        active: parsed.data.active,
      },
    });

    revalidatePath("/pricing-tiers");
    return { status: "success", message: "Pricing tier created" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "A tier with this code already exists",
        fieldErrors: { code: ["Code must be unique"] },
      };
    }

    console.error("createTierAction error", error);
    return {
      status: "error",
      message: "We could not save the tier. Try again shortly.",
    };
  }
}

export type DeleteTierResult = {
  status: "success" | "error";
  message?: string;
};

export async function deleteTierAction(input: { id: string }): Promise<DeleteTierResult> {
  const parsed = deleteTierSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.errors[0]?.message ?? "Invalid tier" };
  }

  try {
    await prisma.customerTier.delete({ where: { id: parsed.data.id } });
    revalidatePath("/pricing-tiers");
    return { status: "success", message: "Pricing tier deleted" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "error", message: "Tier not found" };
    }

    console.error("deleteTierAction error", error);
    return { status: "error", message: "We could not delete this tier" };
  }
}

export async function recomputePricesAction(): Promise<void> {
  // Placeholder recompute hook; actual implementation can hydrate pricing caches.
  await prisma.product.count();
  revalidatePath("/catalog");
  revalidatePath("/pricing-tiers");
}
