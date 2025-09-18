import { NextRequest, NextResponse } from "next/server";
import { deleteTierAction } from "@/app/pricing-tiers/_actions";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!params?.id) {
    return NextResponse.json({ ok: false, error: "Missing tier id" }, { status: 400 });
  }

  const result = await deleteTierAction({ id: params.id });
  if (result.status === "error") {
    return NextResponse.json({ ok: false, error: result.message ?? "Unable to delete" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
