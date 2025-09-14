"use client";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">abc-erp</Link>
        <nav className="flex items-center gap-4">
          <SignedIn>
            <Link href="/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/customers" className="text-sm hover:underline">Customers</Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Sign in</button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
