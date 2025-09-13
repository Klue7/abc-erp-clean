import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // Company (single-tenant for now)
  await db.company.upsert({
    where: { id: "abc-root" },
    update: {},
    create: { id: "abc-root", name: "African Brick Centre PE" }
  });

  // Roles
  const roles = [
    "admin","hr","sales","cashier","yard","security",
    "driver","transport_manager","procurement","mechanic",
    "finance","ceo"
  ];
  for (const slug of roles) {
    await db.role.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug.replace(/_/g, " ").toUpperCase() }
    });
  }

  // Customer tiers
  const tiers = [
    { code: "retail", name: "Retail" },
    { code: "construction", name: "Construction Client" },
    { code: "project", name: "Project/Tender" }
  ];
  for (const t of tiers) {
    await db.customerTier.upsert({
      where: { code: t.code },
      update: {},
      create: t
    });
  }

  console.log("Seeded company, roles, tiers ✅");
}

main().finally(() => db.$disconnect());
