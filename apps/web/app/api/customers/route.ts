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

    const mockCustomers = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        company: "Acme Corp",
        tier: "premium",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2", 
        name: "Jane Smith",
        email: "jane@example.com",
        company: "Tech Solutions",
        tier: "enterprise",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "3",
        name: "Bob Johnson", 
        email: "bob@example.com",
        company: null,
        tier: "basic",
        createdAt: new Date("2024-01-05"),
      },
    ];
    
    const customers = q ? mockCustomers.filter(c => 
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase())
    ) : mockCustomers;
    
    const total = customers.length;
    const filteredCustomers = customers.slice((page - 1) * size, page * size);

    return NextResponse.json({
      customers: filteredCustomers,
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

    const mockCustomer = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(mockCustomer, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
