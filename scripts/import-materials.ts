/* scripts/import-materials.ts */
import minimist from "minimist";
import * as XLSX from "xlsx";
import { PrismaClient, $Enums } from "@prisma/client";
import { computePriceExVat, gpPct, round2 } from "../src/lib/pricing";

const prisma = new PrismaClient();

type QAKind = "MISSING_LANDED" | "TOTAL_MISMATCH" | "PRICE_LT_LANDED";
type QALog = { kind: QAKind; sheet: string; supplier?: string; itemCode?: string; message: string };

function inferUom(desc: string): $Enums.UomCode {
  const s = (desc || "").toUpperCase();
  if (s.includes("PER 1000")) return $Enums.UomCode.per_1000;
  if (/(PER\s+)?(TON|TONNE)/.test(s)) return $Enums.UomCode.per_ton;
  if (s.includes("50KG")) return $Enums.UomCode.per_50kg_bag;
  if (s.includes("8TON")) return $Enums.UomCode.per_8ton_load;
  if (s.includes("26TON")) return $Enums.UomCode.per_26ton_load;
  return $Enums.UomCode.each;
}

function mergeTwoRowHeaders(rows: any[][], idx: number) {
  const top = rows[idx] || [];
  const bottom = rows[idx + 1] || [];
  const headers: string[] = [];
  const width = Math.max(top.length, bottom.length);
  for (let c = 0; c < width; c++) {
    const t = (String(top[c] ?? "")).trim();
    const b = (String(bottom[c] ?? "")).trim();
    const merged = (t + " " + b).trim().replace(/\s+/g, " ").toUpperCase();
    headers.push(merged);
  }
  return headers;
}
function findHeaderStart(rows: any[][]) {
  for (let i = 0; i < rows.length; i++) {
    const a = String(rows[i]?.[0] ?? "").trim().toUpperCase();
    if (a === "ITEM CODE") return i;
  }
  return -1;
}
function findSupplierAbove(rows: any[][], headerIdx: number) {
  const start = Math.max(0, headerIdx - 5);
  for (let i = headerIdx - 1; i >= start; i--) {
    const a = String(rows[i]?.[0] ?? "").trim();
    if (a && a === a.toUpperCase() && a !== "ITEM CODE") return a;
  }
  return undefined;
}
function headerMapIndex(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => (map[h] = i));
  return (label: string) => {
    const key = label.toUpperCase();
    return map[key] ?? -1;
  };
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const file = String(argv.file || argv.f || "");
  const qaPath = String(argv.qa || "qa_import_log.csv");
  if (!file) {
    console.error('Usage: tsx scripts/import-materials.ts --file "C:\path\MATERIALS.xlsx" [--qa qa_import_log.csv]');
    process.exit(1);
  }

  const wb = XLSX.readFile(file);
  const qa: QALog[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

    const headerIdx = findHeaderStart(rows);
    if (headerIdx < 0) continue;
    const headers = mergeTwoRowHeaders(rows, headerIdx);
    const idxOf = headerMapIndex(headers);

    const supplierName = findSupplierAbove(rows, headerIdx) || "UNKNOWN";
    const categoryName = sheetName.trim();

    const colItemCode = 0;
    const colDesc = 1;
    const colUnitCost = idxOf("COST PRICE UNIT COST");
    const colBag = idxOf("BAG");
    const colLoading = idxOf("LOADING FEE");
    const colTransport = idxOf("TRANSPORT PER TON");
    const colTotal = idxOf("TOTAL COST");

    for (let r = headerIdx + 2; r < rows.length; r++) {
      const row = rows[r] || [];
      const itemCode = String(row[colItemCode] ?? "").trim();
      if (!itemCode) continue;
      const description = String(row[colDesc] ?? "").trim();

      const unitCost = Number(row[colUnitCost] ?? 0) || 0;
      const bagCost = Number(row[colBag] ?? 0) || 0;
      const loadingFee = Number(row[colLoading] ?? 0) || 0;
      const transportPerUnit = Number(row[colTransport] ?? 0) || 0;
      const totalProvided = Number(row[colTotal]);
      const hasTotal = Number.isFinite(totalProvided);

      let landed = hasTotal ? Number(totalProvided) : unitCost + bagCost + loadingFee + transportPerUnit;
      landed = round2(landed);

      if (!hasTotal && landed === 0) {
        qa.push({ kind: "MISSING_LANDED", sheet: sheetName, supplier: supplierName, itemCode, message: "No total or components" });
        continue;
      }
      if (hasTotal) {
        const sum = round2(unitCost + bagCost + loadingFee + transportPerUnit);
        if (Math.abs(Number(totalProvided) - sum) > 0.02) {
          qa.push({ kind: "TOTAL_MISMATCH", sheet: sheetName, supplier: supplierName, itemCode, message: `provided=${totalProvided} sum=${sum}` });
        }
      }

      const baseUom = inferUom(description);

      const supplier = await prisma.supplier.upsert({
        where: { name: supplierName },
        update: {},
        create: { name: supplierName },
        select: { id: true },
      });
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
        select: { id: true },
      });
      const product = await prisma.product.upsert({
        where: { itemCode },
        update: { name: description || itemCode, supplierId: supplier.id, categoryId: category.id, baseUomId: undefined },
        create: {
          itemCode,
          name: description || itemCode,
          supplierId: supplier.id,
          categoryId: category.id,
          baseUom: { connect: { code: baseUom } },
        },
        select: { id: true },
      });

      const cost = await prisma.costVersion.create({
        data: {
          productId: product.id,
          effectiveFrom: new Date(),
          sourceWorkbook: file,
          sourceWorkbookHash: null,
          unitCost,
          bagCost,
          loadingFee,
          transportPerUnit,
          otherCost: 0,
          adminPerUnit: 0,
          storagePerUnit: 0,
          totalCostProvided: hasTotal ? Number(totalProvided) : null,
          landedExVat: landed,
          checksum: null,
        },
        select: { id: true, landedExVat: true },
      });

      const tiers = await prisma.priceTier.findMany({ where: { active: true }, select: { id: true, code: true, defaultMarkup: true } });
      for (const t of tiers) {
        const price = computePriceExVat(cost.landedExVat ?? 0, t.defaultMarkup ?? 0);
        const gp = gpPct(price, cost.landedExVat ?? 0);
        await prisma.priceList.upsert({
          where: { costVersionId_tierId: { costVersionId: cost.id, tierId: t.id } },
          update: { markup: t.defaultMarkup ?? 0, priceExVat: price, gpPct: gp },
          create: { costVersionId: cost.id, tierId: t.id, markup: t.defaultMarkup ?? 0, priceExVat: price, gpPct: gp },
        });
        if (Number.isFinite(price) && price < (cost.landedExVat ?? 0)) {
          qa.push({ kind: "PRICE_LT_LANDED", sheet: sheetName, supplier: supplierName, itemCode, message: `tier=${t.code} price=${price} landed=${cost.landedExVat}` });
        }
      }
    }
  }

  const lines = ["kind,sheet,supplier,itemCode,message", ...qa.map(q =>
    [q.kind, q.sheet, q.supplier ?? "", q.itemCode ?? "", q.message.replace(/[
,]+/g, " ")].join(",")
  )];
  require("fs").writeFileSync("qa_import_log.csv", lines.join("
"), "utf8");
  console.log(`✅ Import done. QA rows: ${qa.length}. Wrote qa_import_log.csv`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
