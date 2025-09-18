"use client";

import { useState, useTransition } from "react";
import { deleteTierPriceAction } from "./_actions";

export default function DeletePriceButton({ priceId }: { priceId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm("Delete this tier price?")) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteTierPriceAction({ priceId });
      if (result.status === "error") {
        setError(result.message ?? "Unable to delete tier price");
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        className="text-xs font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Removing..." : "Remove"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
