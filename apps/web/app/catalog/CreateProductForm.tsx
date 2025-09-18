"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProductAction, initialFormState } from "./_actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Creating..." : "Create product"}
    </button>
  );
}

const fieldError = (stateFieldErrors: Record<string, string[]> | undefined, field: string) =>
  stateFieldErrors?.[field]?.[0];

export default function CreateProductForm() {
  const [state, formAction] = useFormState(createProductAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-6"
    >
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">SKU</label>
        <input
          name="sku"
          autoComplete="off"
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="BRK-001"
        />
        {fieldError(state.fieldErrors, "sku") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "sku")}</p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Name</label>
        <input
          name="name"
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="River Sand 1m³"
        />
        {fieldError(state.fieldErrors, "name") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "name")}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Unit</label>
        <input
          name="unit"
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="each"
        />
        {fieldError(state.fieldErrors, "unit") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "unit")}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Base price</label>
        <input
          name="basePrice"
          type="number"
          step="0.01"
          min="0"
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0.00"
        />
        {fieldError(state.fieldErrors, "basePrice") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "basePrice")}</p>
        )}
      </div>

      <div className="sm:col-span-6">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Description</label>
        <input
          name="description"
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Internal notes – supplier, colour, etc."
        />
        {fieldError(state.fieldErrors, "description") && (
          <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "description")}</p>
        )}
      </div>

      <div className="sm:col-span-6 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Product active
        </label>
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
