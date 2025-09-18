"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  addTierPriceSchema,
  createProductSchema,
  deleteProductSchema,
  deleteTierPriceSchema,
  updateProductSchema,
} from "./schemas";

const truthy = new Set(["true", "1", "on", "yes"]);

const toOptionalString = (value: FormDataEntryValue | null): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const toRequiredString = (value: FormDataEntryValue | null): string | undefined =>
  typeof value === "string" ? value : undefined;

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialFormState: FormState = { status: "idle" };

function normalizeActive(value: FormDataEntryValue | null): boolean {
  if (typeof value === "string") return truthy.has(value.toLowerCase());
  return false;
}

export async function createProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = createProductSchema.safeParse({
    sku: toRequiredString(formData.get("sku")),
    name: toRequiredString(formData.get("name")),
    description: toOptionalString(formData.get("description")),
    basePrice: formData.get("basePrice"),
    unit: toOptionalString(formData.get("unit")),
    isActive: normalizeActive(formData.get("isActive")),
  });

  if (!parsed.success) {
    const { formErrors, fieldErrors } = parsed.error.flatten();
    return {
      status: "error",
      message: formErrors.join(" ") || "Please review the highlighted fields",
      fieldErrors,
    };
  }

  try {
    await prisma.product.create({ data: parsed.data });
    revalidatePath("/catalog");
    return { status: "success", message: "Product created" };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "SKU must be unique",
        fieldErrors: { sku: ["This SKU is already in use"] },
      };
    }

    console.error("createProductAction error", error);
    return { status: "error", message: "Could not create product" };
  }
}

export async function updateProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = updateProductSchema.safeParse({
    id: toRequiredString(formData.get("id")),
    sku: toRequiredString(formData.get("sku")),
    name: toRequiredString(formData.get("name")),
    description: toOptionalString(formData.get("description")),
    basePrice: formData.get("basePrice"),
    unit: toOptionalString(formData.get("unit")),
    isActive: normalizeActive(formData.get("isActive")),
  });

  if (!parsed.success) {
    const { formErrors, fieldErrors } = parsed.error.flatten();
    return {
      status: "error",
      message: formErrors.join(" ") || "Please review the highlighted fields",
      fieldErrors,
    };
  }

  try {
    const { id, ...data } = parsed.data;
    await prisma.product.update({ where: { id }, data });
    revalidatePath("/catalog");
    return { status: "success", message: "Product updated" };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "SKU must be unique",
        fieldErrors: { sku: ["This SKU is already in use"] },
      };
    }

    console.error("updateProductAction error", error);
    return { status: "error", message: "Could not update product" };
  }
}

export type DeleteActionResult = {
  status: "success" | "error";
  message?: string;
};

export async function deleteProductAction(input: { id: string }): Promise<DeleteActionResult> {
  const parsed = deleteProductSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.errors[0]?.message ?? "Invalid product" };
  }

  try {
    await prisma.product.delete({ where: { id: parsed.data.id } });
    revalidatePath("/catalog");
    return { status: "success", message: "Product deleted" };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        status: "error",
        message: "Remove tier prices before deleting this product",
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "error", message: "Product not found" };
    }

    console.error("deleteProductAction error", error);
    return { status: "error", message: "Could not delete product" };
  }
}

export async function addTierPriceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = addTierPriceSchema.safeParse({
    productId: toRequiredString(formData.get("productId")),
    tierId: toRequiredString(formData.get("tierId")),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    const { formErrors, fieldErrors } = parsed.error.flatten();
    return {
      status: "error",
      message: formErrors.join(" ") || "Please review the highlighted fields",
      fieldErrors,
    };
  }

  try {
    await prisma.productPrice.upsert({
      where: {
        productId_tierId: {
          productId: parsed.data.productId,
          tierId: parsed.data.tierId,
        },
      },
      create: {
        productId: parsed.data.productId,
        tierId: parsed.data.tierId,
        price: parsed.data.price,
      },
      update: { price: parsed.data.price },
    });

    revalidatePath("/catalog");
    return { status: "success", message: "Tier price saved" };
  } catch (error: unknown) {
    console.error("addTierPriceAction error", error);
    return { status: "error", message: "Could not save tier price" };
  }
}

export async function deleteTierPriceAction(input: { priceId: string }): Promise<DeleteActionResult> {
  const parsed = deleteTierPriceSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.errors[0]?.message ?? "Invalid tier price" };
  }

  try {
    await prisma.productPrice.delete({ where: { id: parsed.data.priceId } });
    revalidatePath("/catalog");
    return { status: "success", message: "Tier price removed" };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { status: "error", message: "Tier price not found" };
    }

    console.error("deleteTierPriceAction error", error);
    return { status: "error", message: "Could not delete tier price" };
  }
}
