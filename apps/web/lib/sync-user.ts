import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

type SyncedUser = {
  id: string;
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

type UserDelegate = {
  upsert: (args: unknown) => Promise<unknown>;
};

type PrismaWithUser = {
  user?: UserDelegate;
};

function getUserDelegate(client: PrismaWithUser): UserDelegate | null {
  try {
    const delegate = client.user;
    if (delegate && typeof delegate.upsert === "function") {
      return delegate;
    }
  } catch {
    // Swallow errors from accessing missing delegate.
  }

  return null;
}

export async function ensureUserInDB(): Promise<SyncedUser | null> {
  if (process.env.DISABLE_USER_SYNC === "1") {
    return null;
  }

  const delegate = getUserDelegate(prisma as PrismaWithUser);
  if (!delegate) {
    return null;
  }

  const clerkUser = await currentUser().catch(() => null);
  if (!clerkUser) {
    return null;
  }

  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    clerkUser.primaryEmailAddress?.emailAddress ??
    undefined;

  const payload = {
    clerkId: clerkUser.id,
    email,
    firstName: clerkUser.firstName ?? undefined,
    lastName: clerkUser.lastName ?? undefined,
  };

  return delegate.upsert({
    where: { clerkId: clerkUser.id },
    update: payload,
    create: payload,
    select: { id: true, clerkId: true, email: true, firstName: true, lastName: true },
  }) as Promise<SyncedUser>;
}
