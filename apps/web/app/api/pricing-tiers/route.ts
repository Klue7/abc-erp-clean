import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapPrismaError } from "@/lib/prismaErrors";
import { createTierSchema } from "@/app/pricing-tiers/schemas";

export const runtime = "nodejs";

const truthy = new Set(["true", "1", "on", "yes"]);

function parseActive(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return truthy.has(value.toLowerCase());
  return false;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function GET() {
  try {
    const tiers = await prisma.customerTier.findMany({
      orderBy: [{ active: "desc" }, { code: "asc" }],
    });
    return NextResponse.json(tiers);
  } catch {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> = {};

  try {
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createTierSchema.safeParse({
    code: toOptionalString(payload.code),
    name: toOptionalString(payload.name),
    description: toOptionalString(payload.description),
    discountPercent: payload.discountPercent,
    active: parseActive(payload.active),
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await prisma.customerTier.create({
      data: parsed.data,
    });

    revalidatePath("/pricing-tiers");

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL("/pricing-tiers", req.url), 303);
    }

    return NextResponse.json({ ok: true, created });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "A pricing tier with that code already exists" },
        { status: 409 },
      );
    }

    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
