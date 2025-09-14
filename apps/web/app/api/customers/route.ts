import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema, customerQuerySchema } from "@/lib/validations";
import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
      const user = await getCurrentUserWithRole();
      if (!user || !hasCustomerAccess(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const { q, page, size } = customerQuerySchema.parse({
      q: searchParams.get("q"),
      page: searchParams.get("page"),
      size: searchParams.get("size"),
    });

    const where = q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ]
    } : {};

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
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
      const user = await getCurrentUserWithRole();
      if (!user || !hasCustomerAccess(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await request.json();
    const data = customerSchema.parse(body);

    const customer = await prisma.customer.create({ data });
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
