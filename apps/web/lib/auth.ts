import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentUserWithRole() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id }
  });
  
  return dbUser;
}

export function hasCustomerAccess(role: string) {
  return role === "admin" || role === "sales";
}
