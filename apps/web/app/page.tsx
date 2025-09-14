"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">abc-erp-clean</h1>
        <SignedIn><UserButton/></SignedIn>
      </header>

      <SignedOut>
        <a className="underline" href="/sign-in">Sign in</a> or{" "}
        <a className="underline" href="/sign-up">Sign up</a>
      </SignedOut>

      <SignedIn>
        <p>Welcome! You’re signed in.</p>
      </SignedIn>
    </main>
  );
}
