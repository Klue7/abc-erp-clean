"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="space-y-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">abc-erp-clean</h1>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <SignedOut>
        <Link className="underline" href="/sign-in">
          Sign in
        </Link>{" "}
        or{" "}
        <Link className="underline" href="/sign-up">
          Sign up
        </Link>
      </SignedOut>

      <SignedIn>
        <p>Welcome! You’re signed in.</p>
      </SignedIn>
    </main>
  );
}
