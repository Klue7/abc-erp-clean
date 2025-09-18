import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAccess() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1") return;
  const user = await getCurrentUserWithRole();
  if (!user || !hasCustomerAccess(user.role)) {
    redirect("/");
  }
}

async function loadCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, company: true, tier: true, createdAt: true },
  });
  if (!customer) notFound();
  return customer;
}

export default async function CustomerPage({ params }: { params: { id: string } }) {
  await ensureAccess();
  const customer = await loadCustomer(params.id);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customer Details</h1>
        <div className="flex gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Edit
          </Link>
          <Link
            href="/customers"
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Back to List
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company</dt>
            <dd className="mt-1 text-sm text-gray-900">{customer.company || "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Tier</dt>
            <dd className="mt-1">
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                {customer.tier}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(customer.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
