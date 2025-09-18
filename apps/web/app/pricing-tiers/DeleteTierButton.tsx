"use client";

import { useState, useTransition } from "react";
import { deleteTierAction } from "./_actions";

export default function DeleteTierButton({ id, code }: { id: string; code: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    if (!confirm(`Delete pricing tier ${code}?`)) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteTierAction({ id });
      if (result.status === "error") {
        setError(result.message ?? "Unable to delete this tier");
      }
    });
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onDelete}
        disabled={pending}
      >
        {pending ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
