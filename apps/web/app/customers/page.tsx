import { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageSearchParams = Record<string, string | string[] | undefined>;

type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  tier: string;
};

const PAGE_SIZE = 10;

export default async function CustomersPage({ searchParams }: { searchParams?: PageSearchParams }) {
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "1";
  const appUser = await getCurrentUserWithRole();

  if (!bypassAuth && !appUser) {
    redirect("/sign-in");
  }

  const authorized = bypassAuth || (appUser ? hasCustomerAccess(appUser.role) : false);

  if (!authorized) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          You don’t have access to this page. Ask an admin to grant permissions.
        </div>
      </main>
    );
  }

  const qParam = searchParams?.q;
  const pageParam = searchParams?.page;
  const q = typeof qParam === "string" ? qParam.trim() : "";
  const page = Number.parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1;

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, company: true, tier: true },
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link
          href="/customers/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          New Customer
        </Link>
      </div>

      <div className="mb-4">
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name or email..."
            className="flex-1 rounded-md border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tier</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer: CustomerListItem) => (
              <tr key={customer.id}>
                <td className="whitespace-nowrap px-6 py-4">{customer.name}</td>
                <td className="whitespace-nowrap px-6 py-4">{customer.email}</td>
                <td className="whitespace-nowrap px-6 py-4">{customer.company ?? "-"}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {customer.tier}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <Link href={"/customers/" + customer.id} className="mr-3 text-blue-600 hover:underline">
                    View
                  </Link>
                  <Link href={"/customers/" + customer.id + "/edit"} className="text-green-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const href = "/customers?page=" + pageNum + (q ? "&q=" + encodeURIComponent(q) : "");
            const classes =
              (pageNum === page
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300") + " rounded-md px-3 py-2";

            return (
              <Link key={pageNum} href={href} className={classes}>
                {pageNum}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
