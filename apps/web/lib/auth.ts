import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

type Role = "admin" | "staff" | "viewer";

export type AppUser = {
  clerkId: string;
  role: Role;
} | null;

type PrismaWithUser = {
  user: {
    findUnique: (args: {
      where: { clerkId: string };
      select: { role: true };
    }) => Promise<{ role: string | null } | null>;
  };
};

function hasUserModel(client: unknown): client is PrismaWithUser {
  try {
    return typeof (client as PrismaWithUser)?.user?.findUnique === "function";
  } catch {
    return false;
  }
}

function normalizeRole(input: string | null | undefined): Role {
  const value = (input ?? "").toString().trim().toLowerCase();
  switch (value) {
    case "admin":
      return "admin";
    case "staff":
    case "sales":
      return "staff";
    case "viewer":
    default:
      return "viewer";
  }
}

const FALLBACK_ROLE = normalizeRole(process.env.DEFAULT_FALLBACK_ROLE ?? "viewer");

export async function getCurrentUserWithRole(): Promise<AppUser> {
  const clerkUser = await currentUser().catch(() => null);
  if (!clerkUser) {
    return null;
  }

  if (process.env.DISABLE_USER_AUTHZ === "1") {
    return { clerkId: clerkUser.id, role: FALLBACK_ROLE };
  }

  if (!hasUserModel(prisma)) {
    return { clerkId: clerkUser.id, role: FALLBACK_ROLE };
  }

  try {
    const dbUser = await (prisma as PrismaWithUser).user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    });

    const role = normalizeRole(dbUser?.role ?? process.env.DEFAULT_FALLBACK_ROLE ?? "viewer");
    return { clerkId: clerkUser.id, role };
  } catch {
    return { clerkId: clerkUser.id, role: FALLBACK_ROLE };
  }
}

export function hasCustomerAccess(role: Role): boolean {
  return role === "admin" || role === "staff";
}
