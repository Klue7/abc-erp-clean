import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserInDB } from "@/lib/sync-user";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Ensure a matching row exists/updates in Neon
  await ensureUserInDB();

  // Read back the DB row using the correct unique key
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  const name = dbUser?.firstName ?? user.firstName ?? "there";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        DB user id: {dbUser?.id ?? "(not found)"}
      </p>
    </main>
  );
}