import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type PrismaError = Prisma.PrismaClientKnownRequestError & {
  meta?: Record<string, unknown> & { target?: string | string[]; fields?: string | string[] };
};

export function mapPrismaError(error: unknown) {
  if (!(error instanceof Error)) return null;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const code = error.code;
    if (code === "P2002") {
      const typedError = error as PrismaError;
      const target = typedError.meta?.target ?? typedError.meta?.fields ?? null;
      const targetStr = Array.isArray(target) ? target.join(", ") : target ?? "";
      const suffix = targetStr ? `: ${targetStr}` : "";
      return NextResponse.json(
        { error: `Unique constraint failed${suffix}` },
        { status: 400 },
      );
    }
    if (code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }

  if (error.message) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return null;
}
