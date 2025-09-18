"use client";

import { useCallback, useEffect, useRef } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function RecomputePricesButton() {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  const handleClick = useCallback(() => {
    toast.info("Recompute started", {
      description: "Rebuilding tier prices…",
    });
  }, []);

  useEffect(() => {
    if (wasPending.current && !pending) {
      toast.success("Recompute complete", {
        description: "Tier prices refreshed",
      });
    }

    wasPending.current = pending;
  }, [pending]);

  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      className="gap-2"
      disabled={pending}
      onClick={handleClick}
    >
      {pending ? "Recomputing…" : "Recompute all prices"}
    </Button>
  );
}
