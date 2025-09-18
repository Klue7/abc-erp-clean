import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const uoms = [
    { code: "each", description: "Each (base unit)", base: true },
    { code: "per_1000", description: "Per 1000 units", base: false },
    { code: "per_ton", description: "Per ton", base: false },
    { code: "per_50kg_bag", description: "Per 50kg bag", base: false },
    { code: "per_8ton_load", description: "Per 8 ton load", base: false },
    { code: "per_26ton_load", description: "Per 26 ton load", base: false },
  ] as const;

  for (const u of uoms) {
    await prisma.uom.upsert({
      where: { code: u.code },
      update: { description: u.description, base: u.base },
      create: { code: u.code, description: u.description, base: u.base },
    });
  }

  const tiers = [
    { code: "RETAIL", name: "Retail", defaultMarkup: 0.4, description: "Retail price (ex-VAT)" },
    { code: "CONTRACTOR", name: "Contractor", defaultMarkup: 0.3, description: "Contractor price (ex-VAT)" },
    { code: "TENDER", name: "Tender", defaultMarkup: 0.15, description: "Tender price (ex-VAT)" },
    { code: "INHOUSE", name: "In-House", defaultMarkup: 0.1, description: "Internal price (ex-VAT)" },
  ] as const;

  for (const t of tiers) {
    await prisma.priceTier.upsert({
      where: { code: t.code },
      update: { name: t.name, defaultMarkup: t.defaultMarkup, active: true, description: t.description },
      create: { code: t.code, name: t.name, defaultMarkup: t.defaultMarkup, active: true, description: t.description },
    });
  }

  console.log("✅ Seed complete: UOMs + PriceTiers upserted");
}

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
