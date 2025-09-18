/**
 * scripts/import-users.ts
 *
 * Usage:
 *   pnpm import:users --file "C:\path\ABC Staff.xlsx" [--sheet "Users"]
 *
 * Expected columns (case-insensitive):
 *   Email (required), Name (optional), Role (optional: ADMIN|STAFF|VIEWER)
 * Extra columns are ignored. Invalid rows are skipped and reported.
 */
import fs from "node:fs";
import path from "node:path";
import minimist from "minimist";
import * as XLSX from "xlsx";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

type ParsedRow = {
  email: string | null;
  name: string | null;
  role: Role;
};

type ReportRow = {
  emailMasked: string;
  status: "upserted" | "skipped" | "error";
  role?: Role;
  reason?: string;
};

function normaliseEmail(value: unknown): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  if (!email) return null;
  if (!email.includes("@")) return null;
  const [user, domain] = email.split("@");
  if (!user || !domain) return null;
  return email;
}

function normaliseRole(value: unknown): Role {
  const input = String(value ?? "").trim().toUpperCase();
  switch (input) {
    case "ADMIN":
      return "ADMIN";
    case "STAFF":
    case "SALESMAN":
    case "SALES":
    case "MANAGER":
    case "SUPERVISOR":
      return "STAFF";
    default:
      return "VIEWER";
  }
}

function parseRow(raw: Record<string, unknown>): ParsedRow {
  const lower: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    lower[key.toLowerCase()] = raw[key];
  }

  const email = normaliseEmail(lower["email"]);
  const name = String(lower["name"] ?? "").trim() || null;
  const role = normaliseRole(lower["role"]);

  return { email, name, role };
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***";
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}***@${domain}`;
}

async function upsertUserByEmail(email: string, name: string | null, role: Role) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (existing?.role === "ADMIN" && role !== "ADMIN") {
    return prisma.user.update({
      where: { email },
      data: { name: name ?? undefined },
    });
  }

  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name ?? undefined,
      role,
    },
    update: {
      name: name ?? undefined,
      role,
    },
  });
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const filePath = (argv.file || argv.f) as string | undefined;
  const sheetHint = (argv.sheet || argv.s) as string | undefined;

  if (!filePath) {
    console.error("ERROR: Provide --file \"C\\\\path\\\\to\\\\users.xlsx\"");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error("ERROR: File not found:", filePath);
    process.exit(1);
  }

  const workbook = XLSX.read(fs.readFileSync(filePath));
  const sheetName = sheetHint && workbook.Sheets[sheetHint] ? sheetHint : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    console.error("ERROR: Sheet not found in workbook.");
    process.exit(1);
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  let imported = 0;
  let skipped = 0;
  const report: ReportRow[] = [];

  for (const raw of rows) {
    const parsed = parseRow(raw);

    if (!parsed.email) {
      skipped += 1;
      report.push({ emailMasked: "***", status: "skipped", reason: "invalid_email" });
      continue;
    }

    try {
      await upsertUserByEmail(parsed.email, parsed.name, parsed.role);
      imported += 1;
      report.push({ emailMasked: maskEmail(parsed.email), status: "upserted", role: parsed.role });
    } catch (error) {
      skipped += 1;
      report.push({ emailMasked: maskEmail(parsed.email), status: "error" });
    }
  }

  const outputName = "user-import-report.csv";
  const header = "email,status,role,reason";
  const body = report.map((row) => [row.emailMasked, row.status, row.role ?? "", row.reason ?? ""].join(","));
  fs.writeFileSync(outputName, [header, ...body].join("\n"));

  console.log(`Imported users: ok=${imported} skipped=${skipped}`);
  console.log(`Report written: ${path.resolve(outputName)}`);
}

main()
  .catch((error) => {
    console.error("Unexpected error", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
