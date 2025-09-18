"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  deleteProductAction,
  initialFormState,
  updateProductAction,
  type FormState,
} from "./_actions";

type ProductFormInput = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  basePrice: number;
  unit: string | null;
  isActive: boolean;
};

const fieldError = (errors: FormState["fieldErrors"], field: string) => errors?.[field]?.[0];

function UpdateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded bg-slate-900 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export default function ProductSettings({ product }: { product: ProductFormInput }) {
  const [state, formAction] = useFormState(updateProductAction, initialFormState);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [pendingDelete, startDelete] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      setDeleteMessage(null);
    }
  }, [state.status]);

  const handleDelete = () => {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    startDelete(async () => {
      const result = await deleteProductAction({ id: product.id });
      if (result.status === "error") {
        setDeleteMessage(result.message ?? "Unable to delete product");
      }
    });
  };

  return (
    <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left font-medium text-gray-700"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Manage product</span>
        <span className="text-xs uppercase tracking-wide text-gray-500">{open ? "Hide" : "Edit"}</span>
      </button>

      {open && (
        <form action={formAction} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-6">
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="sku" value={product.sku} />

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold uppercase text-gray-600">Name</label>
            <input
              name="name"
              defaultValue={product.name}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldError(state.fieldErrors, "name") && (
              <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "name")}</p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold uppercase text-gray-600">Unit</label>
            <input
              name="unit"
              defaultValue={product.unit ?? ""}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldError(state.fieldErrors, "unit") && (
              <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "unit")}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-600">Base price</label>
            <input
              name="basePrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.basePrice.toFixed(2)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldError(state.fieldErrors, "basePrice") && (
              <p className="mt-1 text-xs text-red-600">{fieldError(state.fieldErrors, "basePrice")}</p>
            )}
          </div>

          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold uppercase text-gray-600">Description</label>
            <input
              name="description"
              defaultValue={product.description ?? ""}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                defaultChecked={product.isActive}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Product active
            </label>
            <UpdateButton />
          </div>

          {state.status === "error" && state.message && (
            <p className="sm:col-span-6 text-xs text-red-600">{state.message}</p>
          )}
          {state.status === "success" && state.message && (
            <p className="sm:col-span-6 text-xs text-green-600">{state.message}</p>
          )}
        </form>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>SKU: {product.sku}</span>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded border border-red-200 px-3 py-1 font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pendingDelete}
        >
          {pendingDelete ? "Deleting..." : "Delete product"}
        </button>
      </div>
      {deleteMessage && <p className="mt-2 text-xs text-red-600">{deleteMessage}</p>}
    </div>
  );
}
