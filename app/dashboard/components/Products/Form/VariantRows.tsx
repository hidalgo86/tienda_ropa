"use client";

import React from "react";
import { ProductVariant } from "@/types/product.type";
import { VALID_SIZES } from "@/services/products.services";

interface VariantRowsProps {
  variants: ProductVariant[];
  setVariants: (next: ProductVariant[]) => void;
  disabled: boolean;
}

export default function VariantRows({
  variants,
  setVariants,
  disabled,
}: VariantRowsProps) {
  const addRow = () => {
    const used = new Set(variants.map((v) => v.size)); // ya no necesitamos canonicalizar
    const nextSize = VALID_SIZES.find((s) => !used.has(s)) || VALID_SIZES[0];
    setVariants([...variants, { size: nextSize, price: 0, stock: 0 }]);
  };

  const removeRow = (idx: number) => {
    const next = [...variants];
    next.splice(idx, 1);
    setVariants(next);
  };

  const updateRow = (idx: number, patch: Partial<ProductVariant>) => {
    const next = variants.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    setVariants(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Variantes</label>
        <button
          type="button"
          onClick={addRow}
          disabled={disabled || variants.length >= VALID_SIZES.length}
          className="px-2 py-1 text-sm rounded bg-green-600 text-white disabled:opacity-50"
        >
          + Agregar variante
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Configura precio y stock por talla. No se permiten tallas duplicadas.
      </p>
      <div className="grid grid-cols-12 gap-2 text-sm items-center">
        <div className="col-span-4 font-medium text-gray-600">Talla</div>
        <div className="col-span-4 font-medium text-gray-600">Precio</div>
        <div className="col-span-3 font-medium text-gray-600">Stock</div>
        <div className="col-span-1" />
        {variants.map((v, idx) => (
          <React.Fragment key={`${v.size}-${idx}`}>
            <div className="col-span-4">
              <select
                value={v.size}
                onChange={(e) => updateRow(idx, { size: e.target.value })}
                disabled={disabled}
                className="w-full border rounded px-2 py-1"
              >
                {VALID_SIZES.map((s) => {
                  const usedByOthers = new Set(
                    variants
                      .map((vv, i) => (i === idx ? null : vv.size))
                      .filter(Boolean) as string[]
                  );
                  const disabledOpt = usedByOthers.has(s);
                  return (
                    <option key={s} value={s} disabled={disabledOpt}>
                      {s}
                      {disabledOpt ? " (usada)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-span-4">
              <input
                type="number"
                min="0"
                step="0.01"
                value={v.price === 0 ? "" : v.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    updateRow(idx, { price: 0 });
                  } else {
                    const numValue = Number(value);
                    if (numValue >= 0) {
                      updateRow(idx, { price: numValue });
                    }
                  }
                }}
                disabled={disabled}
                className="w-full border rounded px-2 py-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="0.00"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                min="0"
                step="1"
                value={v.stock === 0 ? "" : v.stock}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    updateRow(idx, { stock: 0 });
                  } else {
                    const numValue = Number(value);
                    if (numValue >= 0 && Number.isInteger(numValue)) {
                      updateRow(idx, { stock: numValue });
                    }
                  }
                }}
                disabled={disabled}
                className="w-full border rounded px-2 py-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="0"
              />
            </div>
            <div className="col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => removeRow(idx)}
                disabled={disabled}
                className="px-2 py-1 text-xs rounded bg-red-500 text-white disabled:opacity-50"
                aria-label="Eliminar variante"
              >
                ✕
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
