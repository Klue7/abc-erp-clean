import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema, customerQuerySchema } from "@/lib/validations";
import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { mapPrismaError } from "@/lib/prismaErrors";

async function authorize() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1") return null;
  const user = await getCurrentUserWithRole();
  if (!user || !hasCustomerAccess(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

function handleError(error: unknown) {
  const mapped = mapPrismaError(error);
  return mapped ?? NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const authResponse = await authorize();
    if (authResponse) return authResponse;

    const { searchParams } = new URL(request.url);
    const { q, page, size } = customerQuerySchema.parse({
      q: searchParams.get("q"),
      page: searchParams.get("page"),
      size: searchParams.get("size"),
    });

    const where: Prisma.CustomerWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: { page, size, total, pages: Math.ceil(total / size) },
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = await authorize();
    if (authResponse) return authResponse;

    const body = await request.json();
    const data = customerSchema.parse(body);

    const created = await prisma.customer.create({ data });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    return handleError(error);
  }
}
