import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ABC ERP</h1>
        <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
      </header>

      <SignedOut>
        <div className="space-x-3">
          <Link className="px-4 py-2 rounded bg-slate-900 text-white" href="/sign-in">Sign in</Link>
          <Link className="px-4 py-2 rounded border" href="/sign-up">Create account</Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="space-x-3">
          <Link className="px-4 py-2 rounded bg-blue-600 text-white" href="/dashboard">Go to Dashboard</Link>
        </div>
      </SignedIn>
    </main>
  );
}
