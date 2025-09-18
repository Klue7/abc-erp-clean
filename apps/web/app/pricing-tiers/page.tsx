import Link from "next/link";

import { prisma } from "@/lib/prisma";
import CreateTierForm from "./CreateTierForm";
import DeleteTierButton from "./DeleteTierButton";
import { RecomputePricesButton } from "./RecomputePricesButton";
import { recomputePricesAction } from "./_actions";

type TierRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountPercent: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const formatPercent = (value: number) => value.toFixed(2) + "%";
const formatDate = (value: Date) =>
  value.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });

export default async function PricingTiersPage() {
  const tiers = await prisma.customerTier.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  const rows: TierRow[] = tiers.map((tier) => ({
    id: tier.id,
    code: tier.code,
    name: tier.name,
    description: tier.description,
    discountPercent: tier.discountPercent,
    active: tier.active,
    createdAt: tier.createdAt,
    updatedAt: tier.updatedAt,
  }));

  const hasRows = rows.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pricing tiers</h1>
          <p className="text-sm text-muted-foreground">
            Centralise discounts for retail, contractor, and partner channels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form action={recomputePricesAction} className="flex items-center">
            <RecomputePricesButton />
          </form>
          <Link
            href="/catalog"
            className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
          >
            View catalog
          </Link>
        </div>
      </div>

      <CreateTierForm />

      {hasRows ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/60 text-sm">
              <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((tier) => {
                  const badgeClass = tier.active
                    ? "inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                    : "inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground";

                  return (
                    <tr key={tier.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-mono text-xs uppercase text-muted-foreground">{tier.code}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{tier.name}</div>
                        {tier.description && (
                          <p className="text-xs text-muted-foreground">{tier.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {formatPercent(tier.discountPercent)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={badgeClass}>{tier.active ? "Active" : "Inactive"}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(tier.createdAt)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(tier.updatedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <DeleteTierButton id={tier.id} code={tier.code} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
          No pricing tiers yet. Create one to unlock contractor pricing.
        </div>
      )}
    </div>
  );
}
