"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          abc-erp
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/catalog">
            Catalog
          </Link>
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/customers">
            Customers
          </Link>
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/employees">
            Employees
          </Link>
          <Link className="text-muted-foreground transition-colors hover:text-foreground" href="/pricing/tiers">
            Pricing tiers
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
