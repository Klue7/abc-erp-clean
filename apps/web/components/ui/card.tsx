import * as React from "react";
import { cn } from "@/lib/utils";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border shadow-sm bg-[oklch(var(--card))] text-[oklch(var(--card-foreground))]",
        className
      )}
    />
  );
}

export const CardHeader = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("px-4 pt-4 pb-2", className)} />;
};

export const CardTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { className, ...rest } = props;
  return <h3 {...rest} className={cn("text-base font-semibold tracking-tight", className)} />;
};

export const CardContent = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("px-4 pb-4 pt-2", className)} />;
};

export const CardFooter = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("px-4 pb-4 pt-2", className)} />;
};
