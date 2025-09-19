import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const node = process.version;
  let pnpm = "unknown";
  try {
    const { execaSync } = await import("execa");
    pnpm = execaSync("pnpm", ["-v"]).stdout.trim();
  } catch {}

  const envs = {
    DATABASE_URL: process.env.DATABASE_URL ?? "(not set)",
    DATABASE_URL_PRICING: process.env.DATABASE_URL_PRICING ?? "(not set)",
    SHADOW_DATABASE_URL_PRICING: process.env.SHADOW_DATABASE_URL_PRICING ?? "(not set)"
  };

  const prisma = new PrismaClient();
  let dbOk = false;
  let pricingTables = "n/a";
  try {
    await prisma.$connect();
    dbOk = true;
    const rows = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
      `select table_name from information_schema.tables where table_schema = 'pricing' limit 5`
    );
    pricingTables = rows?.map((row) => row.table_name).join(", ") || "(none found)";
  } catch (e) {
    console.error("[doctor] DB connect failed:", e);
  } finally {
    await prisma.$disconnect();
  }

  console.log("—— Genesis Doctor ——————————————————————");
  console.log("Node:", node);
  console.log("pnpm:", pnpm);
  console.log("Env:", envs);
  console.log("DB connect:", dbOk ? "OK" : "FAILED");
  console.log("Pricing tables (sample):", pricingTables);
  console.log("Visit http://localhost:3000 after running: pnpm --filter web dev");
  console.log("—————————————————————————————————————————");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
