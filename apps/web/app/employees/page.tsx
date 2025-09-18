import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEmployeeAction } from "@/app/actions/employees";
import { EmployeesDataTable } from "./data-table";

// If Prisma delegate is missing during early setup, surface a friendly message
// @ts-expect-error - runtime guard, not a TS type issue
const hasEmployeeDelegate = !!(prisma && "employee" in prisma);

function NoAccess() {
  return (
    <div className="rounded-md border border-border p-6 text-sm text-muted-foreground">
      You don’t have access to this page. Ask an admin to grant permissions.
    </div>
  );
}

function MissingModel() {
  return (
    <div className="rounded-md border border-border p-6 text-sm">
      <div className="mb-2 font-medium">Employees model is not in the database yet.</div>
      <div>
        Run <code>prisma migrate dev</code> or <code>prisma db push</code> for the pricing schema and refresh.
      </div>
    </div>
  );
}

function canView(role?: string | null) {
  if (!role) return true;
  return ["ADMIN", "MANAGER", "HR", "STAFF"].includes(role.toUpperCase());
}

export default async function EmployeesPage() {
  if (!hasEmployeeDelegate) {
    return (
      <main className="container mx-auto max-w-6xl py-8">
        <h1 className="mb-6 text-2xl font-semibold">Employees</h1>
        <MissingModel />
      </main>
    );
  }

  const user = await getCurrentUserWithRole();
  if (user?.role && !canView(user.role)) {
    return (
      <main className="container mx-auto max-w-6xl py-8">
        <h1 className="mb-6 text-2xl font-semibold">Employees</h1>
        <NoAccess />
      </main>
    );
  }

  const employees = await prisma.employee.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    take: 200,
  });

  return (
    <main className="container mx-auto max-w-6xl space-y-8 py-8">
      <h1 className="text-2xl font-semibold">Employees</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEmployeeAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm">Name</label>
              <Input name="name" placeholder="Jane Doe" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Email</label>
              <Input name="email" type="email" placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Work Email</label>
              <Input name="workEmail" type="email" placeholder="jane.doe@company.co.za" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Role</label>
              <Input name="role" placeholder="Sales / Driver / Admin" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Contact Number</label>
              <Input name="contactNumber" placeholder="000-000-0000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Avatar URL</label>
              <Input name="avatarUrl" placeholder="https://..." />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm">Address (GPS location track)</label>
              <Input name="address" placeholder="Street, City, GPS" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Basic Salary (Rand)</label>
              <Input name="basicSalary" type="number" min="0" step="0.01" placeholder="18000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">ID Number</label>
              <Input name="nationalId" placeholder="Identity number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Bank</label>
              <Input name="bankName" placeholder="Bank name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Bank Account Holder</label>
              <Input name="bankAccountHolder" placeholder="Account holder" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Bank Account Number</label>
              <Input name="bankAccountNumber" placeholder="Account number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Team</label>
              <Input name="team" placeholder="Operations" />
            </div>
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-sm">File uploads / notes</label>
              <Input name="uploadsInfo" placeholder="Links or filenames" />
            </div>
            <div className="flex items-end gap-3">
              <input type="checkbox" name="isActive" defaultChecked className="size-4 accent-current" />
              <span className="text-sm">Active</span>
            </div>
            <div className="sm:col-span-3">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeesDataTable
            data={employees.map((employee) => ({
              id: employee.id,
              employeeId: employee.employeeId,
              name: employee.name,
              email: employee.email,
              workEmail: employee.workEmail,
              contactNumber: employee.contactNumber,
              role: employee.role,
              team: employee.team,
              isActive: employee.isActive,
            }))}
          />
        </CardContent>
      </Card>
    </main>
  );
}
