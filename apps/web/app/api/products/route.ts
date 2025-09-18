import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapPrismaError } from "@/lib/prismaErrors";
import { createProductSchema } from "@/app/catalog/schemas";

export const runtime = "nodejs";

const truthy = new Set(["true", "1", "on", "yes"]);

function parseActive(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return truthy.has(value.toLowerCase());
  return false;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { prices: { include: { tier: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch (error: unknown) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse({
      sku: typeof body.sku === "string" ? body.sku : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      basePrice: body.basePrice,
      unit: typeof body.unit === "string" ? body.unit : undefined,
      isActive: parseActive(body.isActive),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const created = await prisma.product.create({ data: parsed.data });
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "SKU must be unique" }, { status: 409 });
    }

    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
