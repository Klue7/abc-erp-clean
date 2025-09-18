import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = (props: React.TableHTMLAttributes<HTMLTableElement>) => {
  const { className, ...rest } = props;
  return <table {...rest} className={cn("w-full text-sm", className)} />;
};

export const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props} />;
export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />;
export const TableRow = (props: React.HTMLAttributes<HTMLTableRowElement>) => {
  const { className, ...rest } = props;
  return <tr {...rest} className={cn("border-t", className)} />;
};
export const TableHead = (props: React.ThHTMLAttributes<HTMLTableCellElement>) => {
  const { className, ...rest } = props;
  return <th {...rest} className={cn("px-3 py-2 text-left font-medium text-neutral-600", className)} />;
};
export const TableCell = (props: React.TdHTMLAttributes<HTMLTableCellElement>) => {
  const { className, ...rest } = props;
  return <td {...rest} className={cn("px-3 py-2", className)} />;
};
