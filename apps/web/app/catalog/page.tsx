import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function money(value?: number | null) {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

function hasPriceTierModel(client: unknown) {
  try {
    return typeof (client as { priceTier?: { findMany?: unknown } })?.priceTier?.findMany === "function";
  } catch {
    return false;
  }
}

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      supplier: true,
      category: true,
      costs: {
        orderBy: { effectiveFrom: "desc" },
        take: 1,
        include: { prices: { include: { tier: true } } },
      },
    },
  });

  const tiers = hasPriceTierModel(prisma)
    ? await prisma.priceTier.findMany({
        where: { active: true },
        orderBy: { code: "asc" },
        select: { id: true, code: true, name: true, defaultMarkup: true },
      })
    : [];

  const isEmpty = products.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catalog</h1>
        <Badge>{products.length} items</Badge>
      </div>

      {isEmpty ? (
        <Card className="rounded-2xl">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No products found. Import materials to populate the catalog.
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Latest prices (ex-VAT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Landed</TableHead>
                    <TableHead>Retail</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Tender</TableHead>
                    <TableHead>In-House</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const latest = product.costs?.[0];
                    const prices = latest?.prices ?? [];
                    const byCode = Object.fromEntries(prices.map((entry) => [entry.tier.code, entry]));

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">{product.itemCode}</TableCell>
                        <TableCell>
                          <Link href={"/product/" + product.id} className="underline underline-offset-2">
                            {product.name}
                          </Link>
                        </TableCell>
                        <TableCell>{product.supplier?.name ?? "—"}</TableCell>
                        <TableCell>{product.category?.name ?? "—"}</TableCell>
                        <TableCell>{money(latest?.landedExVat)}</TableCell>
                        <TableCell>{money(byCode.RETAIL?.priceExVat)}</TableCell>
                        <TableCell>{money(byCode.CONTRACTOR?.priceExVat)}</TableCell>
                        <TableCell>{money(byCode.TENDER?.priceExVat)}</TableCell>
                        <TableCell>{money(byCode.INHOUSE?.priceExVat)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
