import { currentUser } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const user = await currentUser();
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <pre className="bg-white p-4 rounded border overflow-auto">
        {JSON.stringify({ id: user?.id, email: user?.emailAddresses?.[0]?.emailAddress }, null, 2)}
      </pre>
      <p className="mt-4 text-sm text-slate-600">This page is protected by Clerk.</p>
    </div>
  );
}
