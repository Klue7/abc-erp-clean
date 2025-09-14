// server component
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserInDB } from "../../lib/sync-user";
import { prisma } from "../../lib/prisma";

export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // make sure the row exists / is updated
  await ensureUserInDB();

  // fetch the DB row so we *see* Neon working
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">
        Welcome, {user.firstName ?? "there"}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        This is your dashboard shell.
      </p>

      <div className="mt-6 text-sm">
        <div><b>Neon user id:</b> {dbUser?.id ?? "—"}</div>
        <div><b>email:</b> {dbUser?.email ?? "—"}</div>
        <div><b>clerkUserId:</b> {dbUser?.clerkUserId ?? "—"}</div>
      </div>
    </main>
  );
}
