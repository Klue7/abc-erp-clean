import { prisma } from "@/lib/prisma";
import { recomputeAllPricesAction, updateTierAction } from "@/app/actions/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type PrismaWithPriceTier = {
  priceTier?: {
    findMany: (args: unknown) => Promise<Array<{
      id: string;
      code: string;
      name: string;
      defaultMarkup: number;
      active: boolean;
    }>>;
  };
};

function hasPriceTierModel(client: PrismaWithPriceTier): client is Required<PrismaWithPriceTier> {
  try {
    return typeof client.priceTier?.findMany === "function";
  } catch {
    return false;
  }
}

function Percent({ value }: { value: number }) {
  return <span className="tabular-nums">{(value * 100).toFixed(2)}%</span>;
}

async function TiersGrid() {
  if (!hasPriceTierModel(prisma)) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Pricing datastore is not initialised. The PriceTier model is missing.
        </CardContent>
      </Card>
    );
  }

  const tiers = await prisma.priceTier.findMany({
    orderBy: { code: "asc" },
  });

  if (!tiers.length) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No pricing tiers found. Seed the database to populate defaults.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tiers.map((tier) => (
        <form key={tier.id} action={updateTierAction} className="contents">
          <input type="hidden" name="id" value={tier.id} />
          <Card className="rounded-2xl">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-base">{tier.name}</CardTitle>
              <span className="rounded-full bg-muted px-2 py-1 text-xs uppercase text-muted-foreground">
                {tier.code}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Default markup: <b><Percent value={tier.defaultMarkup} /></b>
              </div>
              <div className="space-y-1">
                <Label htmlFor={'name-' + tier.id}>Name</Label>
                <Input id={'name-' + tier.id} name="name" defaultValue={tier.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={'markup-' + tier.id}>Default markup (0–1)</Label>
                <Input
                  id={'markup-' + tier.id}
                  name="defaultMarkup"
                  type="number"
                  step="0.01"
                  min={0}
                  max={5}
                  defaultValue={tier.defaultMarkup}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor={'active-' + tier.id}>Active</Label>
                <Switch id={'active-' + tier.id} name="active" defaultChecked={tier.active} />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" type="submit">
                Save
              </Button>
            </CardFooter>
          </Card>
        </form>
      ))}
    </div>
  );
}

export default async function PricingTiersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pricing Tiers</h1>
        <form action={recomputeAllPricesAction}>
          <Button type="submit">Recompute all prices</Button>
        </form>
      </div>
      {/* @ts-expect-error Async Server Component */}
      <TiersGrid />
    </div>
  );
}
