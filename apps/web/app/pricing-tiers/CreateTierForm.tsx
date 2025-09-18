"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createTierAction, initialTierFormState, TierFormState } from "./_actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Creating..." : "Create tier"}
    </button>
  );
}

export default function CreateTierForm() {
  const [state, formAction] = useFormState(createTierAction, initialTierFormState);

  const fieldError = (field: keyof NonNullable<TierFormState["fieldErrors"]>) =>
    state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-6">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium uppercase text-gray-500">Code</label>
        <input
          name="code"
          autoComplete="off"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="RETAIL"
        />
        {fieldError("code") && <p className="mt-1 text-xs text-red-600">{fieldError("code")}</p>}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-medium uppercase text-gray-500">Name</label>
        <input
          name="name"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Retail walk-in"
        />
        {fieldError("name") && <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>}
      </div>

      <div className="sm:col-span-1">
        <label className="block text-xs font-medium uppercase text-gray-500">Discount %</label>
        <input
          name="discountPercent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0.0"
        />
        {fieldError("discountPercent") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("discountPercent")}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label className="block text-xs font-medium uppercase text-gray-500">Active</label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="tier-active"
            name="active"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="tier-active" className="text-sm text-gray-700">Active</label>
        </div>
        {fieldError("active") && <p className="mt-1 text-xs text-red-600">{fieldError("active")}</p>}
      </div>

      <div className="sm:col-span-6">
        <label className="block text-xs font-medium uppercase text-gray-500">Description</label>
        <input
          name="description"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Short internal context"
        />
        {fieldError("description") && <p className="mt-1 text-xs text-red-600">{fieldError("description")}</p>}
      </div>

      <div className="sm:col-span-6 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Discounts are applied against the product base price for contractor/partner customer tiers.
        </p>
        <SubmitButton />
      </div>

      {state.status === "error" && state.message && (
        <p className="sm:col-span-6 text-sm text-red-600">{state.message}</p>
      )}
      {state.status === "success" && state.message && (
        <p className="sm:col-span-6 text-sm text-green-600">{state.message}</p>
      )}
    </form>
  );
}
