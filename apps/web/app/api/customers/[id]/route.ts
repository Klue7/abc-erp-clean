import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";
import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
      const user = await getCurrentUserWithRole();
      if (!user || !hasCustomerAccess(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
      const user = await getCurrentUserWithRole();
      if (!user || !hasCustomerAccess(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await request.json();
    const data = customerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
      const user = await getCurrentUserWithRole();
      if (!user || !hasCustomerAccess(user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
