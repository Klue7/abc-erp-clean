import { getCurrentUserWithRole, hasCustomerAccess } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerForm from "../components/CustomerForm";

export default async function NewCustomerPage() {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
    const user = await getCurrentUserWithRole();
    if (!user || !hasCustomerAccess(user.role)) {
      redirect("/");
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Customer</h1>
      <CustomerForm />
    </main>
  );
}
