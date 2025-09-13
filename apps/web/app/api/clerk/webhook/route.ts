import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@abc/db/src/client";

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_SECRET_KEY;
  const svix_id = req.headers.get("svix-id") ?? "";
  const svix_timestamp = req.headers.get("svix-timestamp") ?? "";
  const svix_signature = req.headers.get("svix-signature") ?? "";

  if (!secret) return NextResponse.json({ error: "missing secret" }, { status: 500 });

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(secret);
  try {
    wh.verify(body, { "svix-id": svix_id, "svix-timestamp": svix_timestamp, "svix-signature": svix_signature });
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const type = payload.type as string;

  if (type === "user.created" || type === "user.updated") {
    const u = payload.data;
    const email = u.email_addresses?.[0]?.email_address as string | undefined;
    await prisma.user.upsert({
      where: { clerkUserId: u.id },
      create: {
        clerkUserId: u.id,
        email: email ?? `${u.id}@example.invalid`,
        firstName: u.first_name ?? null,
        lastName: u.last_name ?? null
      },
      update: {
        email: email ?? undefined,
        firstName: u.first_name ?? undefined,
        lastName: u.last_name ?? undefined
      }
    });
  }

  return NextResponse.json({ ok: true });
}
