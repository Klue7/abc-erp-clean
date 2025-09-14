import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function ensureUserInDB() {
  const u = await currentUser();
  if (!u) return null;

  const email =
    u.emailAddresses?.[0]?.emailAddress ?? `${u.id}@placeholder.local`;

  // Create/update a matching row in Neon via Prisma
  const user = await prisma.user.upsert({
    where: { clerkUserId: u.id },
    update: {
      email,
      firstName: u.firstName ?? undefined,
      lastName: u.lastName ?? undefined,
    },
    create: {
      clerkUserId: u.id,
      email,
      firstName: u.firstName ?? null,
      lastName: u.lastName ?? null,
    },
  });

  return user;
}
