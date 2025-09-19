"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleEmployeeActiveAction } from "@/app/actions/employees";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type EmployeeRow = {
  id: string;
  employeeId: string;
  name: string;
  email: string | null;
  workEmail: string | null;
  contactNumber: string | null;
  address: string | null;
  bankName: string | null;
  bankAccountHolder: string | null;
  bankAccountNumber: string | null;
  avatarUrl: string | null;
  basicSalary: number | null;
  nationalId: string | null;
  uploadsInfo: string | null;
  role: string | null;
  team: string | null;
  isActive: boolean;
};

interface EmployeesDataTableProps {
  data: EmployeeRow[];
}

export function EmployeesDataTable({ data }: EmployeesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogEmployee, setDialogEmployee] = React.useState<EmployeeRow | null>(null);

  const columns = React.useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "employeeId",
        header: "ID",
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.employeeId}</span>,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            className="flex items-center gap-1 text-left text-sm font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.workEmail && (
              <div className="text-xs text-muted-foreground">{row.original.workEmail}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? "—"}</span>,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => row.original.role ?? "—",
      },
      {
        accessorKey: "team",
        header: "Team",
        cell: ({ row }) => row.original.team ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={row.original.isActive ? undefined : "bg-muted text-muted-foreground"}>
            {row.original.isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const employee = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted/40"
                  aria-label="Open actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setDialogEmployee(employee);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <form action={toggleEmployeeActiveAction.bind(null, employee.id)}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full text-left">
                      {employee.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </DropdownMenuItem>
                </form>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Delete</DropdownMenuItem>
                <DropdownMenuItem disabled>Share</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [setDialogEmployee, setDialogOpen]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="h-9 w-full max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="h-9 px-3">
              Columns <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-6 text-center text-sm text-muted-foreground">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
        </div>
        <div className="space-x-2">
          <Button
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <EmployeeDetailDialog
        employee={dialogEmployee}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

interface EmployeeDetailDialogProps {
  employee: EmployeeRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EmployeeDetailDialog({ employee, open, onOpenChange }: EmployeeDetailDialogProps) {
  if (!employee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Employee details</DialogTitle>
          <p className="text-sm text-muted-foreground">No employee selected.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const money = (value: number | null | undefined) =>
    value == null ? "—" : `R ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="mb-3 text-lg font-semibold">{employee.name}</DialogTitle>
        <div className="grid gap-3 text-sm">
          <DetailRow label="Employee ID" value={employee.employeeId} mono />
          <DetailRow label="Email" value={employee.email ?? "—"} />
          <DetailRow label="Work email" value={employee.workEmail ?? "—"} />
          <DetailRow label="Contact" value={employee.contactNumber ?? "—"} />
          <DetailRow label="Role" value={employee.role ?? "—"} />
          <DetailRow label="Team" value={employee.team ?? "—"} />
          <DetailRow label="Status" value={employee.isActive ? "Active" : "Inactive"} />
          <DetailRow label="Address" value={employee.address ?? "—"} />
          <DetailRow label="Bank" value={employee.bankName ?? "—"} />
          <DetailRow label="Account holder" value={employee.bankAccountHolder ?? "—"} />
          <DetailRow label="Account number" value={employee.bankAccountNumber ?? "—"} />
          <DetailRow label="Basic salary" value={money(employee.basicSalary)} />
          <DetailRow label="ID number" value={employee.nationalId ?? "—"} />
          <DetailRow label="Uploads / notes" value={employee.uploadsInfo ?? "—"} />
          <DetailRow label="Avatar URL" value={employee.avatarUrl ?? "—"} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
    </div>
  );
}
