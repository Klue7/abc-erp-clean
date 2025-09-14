import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Welcome, {user.firstName ?? "there"}</h1>
      <p className="mt-2 text-sm text-gray-600">This is your dashboard shell.</p>
    </main>
  );
}
