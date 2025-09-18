import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function ensureUserInDB() {
  const { userId, sessionClaims } = auth();
  if (!userId) return null;

  const email = (sessionClaims?.email as string | undefined) ?? null;
  const first = (sessionClaims?.first_name as string | undefined) ?? null;
  const last  = (sessionClaims?.last_name  as string | undefined) ?? null;

  await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email: email ?? undefined, firstName: first ?? undefined, lastName: last ?? undefined },
    create: { clerkId: userId, email: email ?? "", firstName: first, lastName: last },
  });
}