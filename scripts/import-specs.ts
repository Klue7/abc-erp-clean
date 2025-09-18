/* scripts/import-specs.ts */
import minimist from "minimist";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SPEC_FIELDS = new Set([
  "lengthMm","widthMm","heightMm","unitWeightKg","densityKgPerM3","packQty",
  "bricksPerPallet","palletDimensionsMm","techSpecsLink","msdsLink",
  "applicationNotes","factoryLeadTimeDays","abcStockLeadTimeDays",
  "minOrderQty","reorderPoint","safetyStock","notes",
]);

function asNumber(value: any): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const file = String(argv.file || argv.f || "");
  const force = Boolean(argv.force);
  if (!file) {
    console.error('Usage: tsx scripts/import-specs.ts --file "C:\path\specs.xlsx" [--force]');
    process.exit(1);
  }
  const wb = XLSX.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

  const headers = (rows[0] || []).map((h: any) => String(h || "").trim());
  const idxOf: Record<string, number> = {};
  headers.forEach((h, i) => (idxOf[h] = i));

  if (!('itemCode' in idxOf)) {
    console.error('Missing required column: itemCode');
    process.exit(1);
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const itemCode = String(row[idxOf['itemCode']] ?? '').trim();
    if (!itemCode) continue;

    const product = await prisma.product.findUnique({ where: { itemCode }, select: { id: true } });
    if (!product) continue;

    const existing = await prisma.productSpec.findUnique({ where: { productId: product.id } });
    const patch: Record<string, any> = {};

    for (const [key, idx] of Object.entries(idxOf)) {
      if (!SPEC_FIELDS.has(key)) continue;
      const val = row[idx];
      if (val === undefined || val === null || val === '') continue;
      const isNumeric = /Mm|Kg|M3|Qty|Point|Stock|Days/i.test(key);
      patch[key] = isNumeric ? asNumber(val) ?? String(val).trim() : String(val).trim();
    }

    if (existing && !force) {
      for (const [k, v] of Object.entries(patch)) {
        // @ts-ignore
        if (existing[k as keyof typeof existing] != null) delete patch[k];
      }
    }

    if (existing) {
      if (Object.keys(patch).length > 0) {
        await prisma.productSpec.update({ where: { productId: product.id }, data: patch });
      }
    } else {
      await prisma.productSpec.create({ data: { productId: product.id, ...patch } });
    }
  }

  console.log('✅ Specs import complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
