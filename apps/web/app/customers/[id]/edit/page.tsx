import { redirect, notFound } from "next/navigation";
import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerForm from "../../components/CustomerForm";

async function ensureAccess() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1") return;
  const user = await getCurrentUserWithRole();
  if (!user || !hasCustomerAccess(user.role)) {
    redirect("/");
  }
}

async function loadCustomer(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();
  return customer;
}

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  await ensureAccess();

  const customer = await loadCustomer(params.id);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Edit Customer</h1>
      <CustomerForm customer={customer} />
    </main>
  );
}
