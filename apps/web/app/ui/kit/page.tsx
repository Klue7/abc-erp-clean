import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function UIKIT() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">UI Kit — shadcn/ui + OKLCH Blue & Charcoal</h1>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>Form controls</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1"><Label>Name</Label><Input placeholder="Type here" /></div>
          <div className="space-y-1"><Label>Active</Label><div><Switch defaultChecked /></div></div>
          <div className="space-y-2"><Label>Actions</Label><div className="flex gap-2"><Button>Save</Button><Button className="bg-[oklch(var(--secondary))] text-[oklch(var(--secondary-foreground))]">Cancel</Button></div></div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>Table</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Price</TableHead></TableRow></TableHeader>
              <TableBody><TableRow><TableCell className="font-mono text-xs">ABC-001</TableCell><TableCell>Sample Item</TableCell><TableCell><Badge>Active</Badge></TableCell><TableCell>R 1,234.00</TableCell></TableRow></TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
