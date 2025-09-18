import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 px-3 py-2",
  {
    variants: {
      variant: {
        default: "bg-[oklch(var(--primary))] text-[oklch(var(--primary-foreground))] hover:brightness-95",
        secondary: "bg-[oklch(var(--secondary))] text-[oklch(var(--secondary-foreground))] hover:brightness-95",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
