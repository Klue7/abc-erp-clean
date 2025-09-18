"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const LABEL = "Toggle theme";

export function ThemeToggle() {
  const { toggle } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={LABEL}
      title={LABEL}
      onClick={toggle}
      className="h-8 px-2"
    >
      {/* Render both icons for identical SSR/CSR markup; dark mode hides/shows via CSS. */}
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="hidden h-4 w-4 dark:inline" />
    </Button>
  );
}
