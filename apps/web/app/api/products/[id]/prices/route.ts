import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mapPrismaError } from "@/lib/prismaErrors";
import { addTierPriceSchema } from "@/app/catalog/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params?.id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = addTierPriceSchema.safeParse({
      productId: params.id,
      tierId: body?.tierId,
      price: body?.price,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const saved = await prisma.productPrice.upsert({
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

    return NextResponse.json(saved, { status: 201 });
  } catch (error: unknown) {
    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json().catch(() => null);
    const priceId = (body as { priceId?: string } | null)?.priceId ?? params?.id;
    if (!priceId) {
      return NextResponse.json({ error: "Missing price id" }, { status: 400 });
    }

    await prisma.productPrice.delete({ where: { id: priceId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Tier price not found" }, { status: 404 });
    }

    const mapped = mapPrismaError(error);
    if (mapped) return mapped;
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
