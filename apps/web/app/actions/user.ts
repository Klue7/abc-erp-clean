"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

function hasUserModel(client: unknown): client is { user: { upsert: Function } } {
  try {
    return typeof (client as { user?: { upsert?: unknown } }).user?.upsert === "function";
  } catch {
    return false;
  }
}

export async function syncUserAction() {
  if (process.env.DISABLE_USER_SYNC === "1") {
    return { ok: false as const, reason: "disabled" as const };
  }

  if (!hasUserModel(prisma)) {
    return { ok: false as const, reason: "no_model" as const };
  }

  const clerkUser = await currentUser().catch(() => null);
  if (!clerkUser) {
    return { ok: false as const, reason: "no_session" as const };
  }

  const fallbackEmail = `${clerkUser.id}@users.noreply`;
  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    clerkUser.primaryEmailAddress?.emailAddress ??
    fallbackEmail;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      firstName: clerkUser.firstName ?? undefined,
      lastName: clerkUser.lastName ?? undefined,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName ?? undefined,
      lastName: clerkUser.lastName ?? undefined,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");

  return { ok: true as const, id: user.id };
}
