import { prisma } from "@/lib/prisma";
import { getCurrentUserWithRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createEmployeeAction, toggleEmployeeActiveAction } from "@/app/actions/employees";

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
              <label className="text-sm">Role</label>
              <Input name="role" placeholder="Sales / Driver / Admin" />
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
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left [&>th]:px-3 [&>th]:py-2">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&>tr]:border-t">
                {employees.map((employee) => (
                  <tr key={employee.id} className="[&>td]:px-3 [&>td]:py-2">
                    <td>{employee.name}</td>
                    <td className="text-muted-foreground">{employee.email ?? "—"}</td>
                    <td>{employee.role ?? "—"}</td>
                    <td>
                      <Badge className={employee.isActive ? undefined : "bg-muted text-muted-foreground"}>
                        {employee.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <form action={toggleEmployeeActiveAction.bind(null, employee.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          {employee.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                      No employees yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
