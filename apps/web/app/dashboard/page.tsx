import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { syncUserAction } from "@/app/actions/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

function hasUserModel(client: unknown): client is { user: { findUnique: Function } } {
  try {
    return typeof (client as { user?: { findUnique?: unknown } }).user?.findUnique === "function";
  } catch {
    return false;
  }
}

export default async function Page() {
  const clerkUser = await currentUser().catch(() => null);
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const canQueryDbUser = hasUserModel(prisma);
  const syncDisabled = process.env.DISABLE_USER_SYNC === "1";

  const dbUser = canQueryDbUser
    ? await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
        select: { id: true, role: true, email: true, firstName: true, lastName: true },
      })
    : null;

  const statusLabel = !canQueryDbUser
    ? "N/A"
    : syncDisabled
    ? "DISABLED"
    : dbUser
    ? "SYNCED"
    : "NOT FOUND";

  const welcomeName = clerkUser.firstName ?? clerkUser.fullName ?? "there";

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {welcomeName}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">App session (Clerk)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Clerk ID:</span>{" "}
              <code className="font-mono">{clerkUser.id}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              {clerkUser.emailAddresses?.[0]?.emailAddress ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              {clerkUser.fullName ?? "—"}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-base">Database user</CardTitle>
            <Badge className="bg-neutral-200 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
              {statusLabel}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">DB user id:</span>{" "}
              <code className="font-mono">{dbUser?.id ?? "—"}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>{" "}
              {dbUser?.role ?? (canQueryDbUser ? "—" : "not configured")}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              {dbUser?.email ?? "—"}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            {!canQueryDbUser ? (
              <div className="text-xs text-muted-foreground">
                User model not present in this database (pricing-only). Sync disabled.
              </div>
            ) : syncDisabled ? (
              <div className="text-xs text-muted-foreground">
                User sync disabled via <code className="font-mono">DISABLE_USER_SYNC=1</code>.
              </div>
            ) : (
              <form action={syncUserAction}>
                <Button type="submit" size="sm">
                  {dbUser ? "Resync user" : "Create DB user"}
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
