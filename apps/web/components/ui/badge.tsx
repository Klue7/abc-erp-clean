import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = (props: React.HTMLAttributes<HTMLSpanElement>) => {
  const { className, ...rest } = props;
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide dark:bg-neutral-800",
        className
      )}
    />
  );
};
