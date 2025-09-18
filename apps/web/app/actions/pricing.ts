"use server";

import { prisma } from "@/lib/prisma";

type PrismaWithPriceTier = {
  priceTier?: {
    update: (args: unknown) => Promise<unknown>;
  };
};

function hasPriceTierModel(client: PrismaWithPriceTier): client is Required<PrismaWithPriceTier> {
  try {
    return typeof client.priceTier?.update === "function";
  } catch {
    return false;
  }
}

export async function updateTierAction(formData: FormData) {
  if (!hasPriceTierModel(prisma)) {
    return { ok: false as const, reason: "no_model" as const };
  }

  const id = String(formData.get("id") ?? "").trim();
  const rawName = formData.get("name");
  const rawMarkup = formData.get("defaultMarkup");
  const active = Boolean(formData.get("active"));

  if (!id) {
    return { ok: false as const, reason: "invalid_id" as const };
  }

  const name = typeof rawName === "string" && rawName.trim().length > 0 ? rawName.trim() : undefined;
  const defaultMarkup = typeof rawMarkup === "string" ? Number.parseFloat(rawMarkup) : Number(rawMarkup);

  await prisma.priceTier.update({
    where: { id },
    data: {
      name,
      defaultMarkup: Number.isFinite(defaultMarkup) ? defaultMarkup : undefined,
      active,
    },
  });

  return { ok: true as const };
}

export async function recomputeAllPricesAction() {
  // Placeholder for future recompute job. Intentionally a no-op.
  return { ok: true as const };
}
