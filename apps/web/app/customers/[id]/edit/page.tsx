import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerForm from "../../components/CustomerForm";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  // if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
  //   const user = await getCurrentUserWithRole();
  //   if (!user || !hasCustomerAccess(user.role)) {
  //     redirect("/");
  //   }
  // }

  const customer = {
    id: params.id,
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Corp", 
    tier: "premium",
    createdAt: new Date("2024-01-15"),
  };

  // if (!customer) {
  //   notFound();
  // }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Customer</h1>
      <CustomerForm customer={customer} />
    </main>
  );
}
