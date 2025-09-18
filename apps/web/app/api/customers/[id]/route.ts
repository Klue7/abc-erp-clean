import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";
import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { mapPrismaError } from "@/lib/prismaErrors";

type RouteContext = { params: { id: string } };

function ensureAuthorized() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1") return null;
  return getCurrentUserWithRole().then((user) => {
    if (!user || !hasCustomerAccess(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return null;
  });
}

function errorResponse(error: unknown) {
  const mapped = mapPrismaError(error);
  return mapped ?? NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const authResponse = await ensureAuthorized();
    if (authResponse) return authResponse;

    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json(customer);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const authResponse = await ensureAuthorized();
    if (authResponse) return authResponse;

    const body = await request.json();
    const data = customerSchema.parse(body);

    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updated = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const authResponse = await ensureAuthorized();
    if (authResponse) return authResponse;

    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
