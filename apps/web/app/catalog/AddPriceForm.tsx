"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addTierPriceAction, initialFormState } from "./_actions";

type TierOption = { id: string; code: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save price"}
    </button>
  );
}

export default function AddPriceForm({
  productId,
  tiers,
  existingTierIds = [],
}: {
  productId: string;
  tiers: TierOption[];
  existingTierIds?: string[];
}) {
  const [state, formAction] = useFormState(addTierPriceAction, initialFormState);

  const defaultTierId = useMemo(
    () => tiers.find((tier) => !existingTierIds.includes(tier.id))?.id ?? tiers[0]?.id ?? "",
    [tiers, existingTierIds],
  );

  const [tierId, setTierId] = useState(defaultTierId);
  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    setTierId(defaultTierId);
  }, [defaultTierId]);

  useEffect(() => {
    if (state.status === "success") {
      setPrice("");
    }
  }, [state.status]);

  const tierAlreadySet = (id: string) => existingTierIds.includes(id);

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-2 text-sm">
      <input type="hidden" name="productId" value={productId} />
      <label className="flex flex-col text-xs font-medium uppercase text-gray-500">
        Tier
        <select
          name="tierId"
          value={tierId}
          onChange={(event) => setTierId(event.target.value)}
          className="mt-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {tiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.code} — {tier.name}
              {tierAlreadySet(tier.id) ? " (set)" : ""}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-xs font-medium uppercase text-gray-500">
        Price
        <input
          name="price"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="0.00"
          className="mt-1 w-28 rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </label>

      <SubmitButton />

      <div className="basis-full" />

      {state.fieldErrors?.tierId?.[0] && (
        <p className="text-xs text-red-600">{state.fieldErrors.tierId[0]}</p>
      )}
      {state.fieldErrors?.price?.[0] && (
        <p className="text-xs text-red-600">{state.fieldErrors.price[0]}</p>
      )}
      {state.status === "error" && state.message && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}
      {state.status === "success" && state.message && (
        <p className="text-xs text-green-600">{state.message}</p>
      )}
    </form>
  );
}
