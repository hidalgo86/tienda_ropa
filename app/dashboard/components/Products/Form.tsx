"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductClient, ProductServer } from "@/types/product.type";
import { createProduct, updateProduct } from "@/services/products.services";

// ------------------ Tipos ------------------
type Mode = "create" | "edit";

interface FormProductProps {
  mode?: Mode;
  product?: ProductServer | null;
}

// ------------------ Valores por defecto ------------------
const DEFAULT_FORM: ProductClient = {
  id: "",
  name: "",
  genre: "unisex",
  description: "",
  size: "",
  price: 0,
  stock: 1,
  imageUrl: "",
  imagePublicId: "",
};

// ------------------ Input reutilizable ------------------
interface InputProps {
  label: string;
  name: keyof ProductClient;
  value: string | number;
  type?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  required?: boolean;
  disabled?: boolean;
}

const InputField = ({
  label,
  name,
  value,
  type = "text",
  onChange,
  required,
  disabled = false,
}: InputProps) => (
  <div className="mb-3">
    <label className="block mb-1">{label}</label>
    {type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    ) : (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    )}
  </div>
);

// ------------------ Select reutilizable ------------------
interface SelectProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const SelectField = ({
  label,
  value,
  options,
  onChange,
  required,
  disabled = false,
}: SelectProps) => (
  <div className="mb-3">
    <label className="block mb-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full border rounded px-2 py-1 disabled:opacity-50"
      required={required}
      disabled={disabled}
    >
      <option value="">Selecciona {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// ------------------ Helper ------------------
// Canoniza una talla a su forma estándar (ej: M3 -> 3M, T2 -> 2T)
function canonicalizeSize(raw: string): string {
  const s = raw.trim().toUpperCase();
  // Patrones invertidos posibles por haber guardado la KEY del enum en lugar del VALUE
  // Enum backend usa valores: 3M, 6M, 9M, 12M ... y 2T, 3T, etc.
  // Si llega M3 lo convertimos a 3M. Si llega T2 a 2T.
  const mMatch = /^M(\d+)$/.exec(s); // M3 -> 3M
  if (mMatch) return `${mMatch[1]}M`;
  const tMatch = /^T(\d+)$/.exec(s); // T2 -> 2T
  if (tMatch) return `${tMatch[1]}T`;
  return s;
}

const toServerProduct = (form: ProductClient): ProductServer => ({
  ...form,
  genre: (form.genre || "unisex").toLowerCase() as "niña" | "niño" | "unisex",
  price: Number(form.price),
  stock: Number(form.stock),
  // Enviamos tallas canonizadas
  size: form.size
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(canonicalizeSize),
});

// Normaliza arrays de talla que vienen anidados como strings JSON, ej: ["[\"RN\"]"]
function normalizeSizes(raw: string[] | undefined | null): string {
  if (!raw || raw.length === 0) return "";
  const flat: string[] = [];

  // Se reemplaza any por unknown para cumplir regla eslint y se restringe el flujo
  const process = (val: unknown): void => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          process(parsed);
          return;
        } catch {
          // ignorar error de parse y continuar
        }
      }
      if (
        trimmed.startsWith('"') &&
        trimmed.endsWith('"') &&
        trimmed.length > 1
      ) {
        flat.push(trimmed.slice(1, -1));
      } else {
        flat.push(trimmed);
      }
    } else if (Array.isArray(val)) {
      val.forEach(process);
    }
  };

  raw.forEach(process);

  const clean = Array.from(
    new Set(
      flat
        .filter(Boolean)
        .map((v) => v.toUpperCase())
        .map(canonicalizeSize)
    )
  );
  return clean.join(",");
}

// ------------------ Componente principal ------------------
export default function FormProducto({
  mode = "create",
  product,
}: FormProductProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProductClient>({ ...DEFAULT_FORM });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = ["niña", "niño", "unisex"];
  const stockOptions = Array.from({ length: 101 }, (_, i) => i);
  const ALLOWED_SIZES = [
    "RN",
    "3M",
    "6M",
    "9M",
    "12M",
    "18M",
    "24M",
    "2T",
    "3T",
    "4T",
    "5T",
    "6T",
    "7T",
    "8T",
    "9T",
    "10T",
    "12T",
  ];

  // Componente interno para seleccionar múltiples tallas
  const MultiSizeSelect = ({
    value,
    disabled,
    onChange,
  }: {
    value: string;
    disabled: boolean;
    onChange: (val: string) => void;
  }) => {
    const selected = value
      ? value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => canonicalizeSize(s))
      : [];
    const selectedSet = new Set(selected);

    const toggle = (size: string) => {
      const up = size.toUpperCase();
      let next: string[];
      if (selectedSet.has(up)) {
        next = selected.filter((s) => s !== up);
      } else {
        next = [...selected, up];
      }
      onChange(Array.from(new Set(next)).join(","));
    };

    return (
      <div className="mb-3">
        <label className="block mb-1">Talla (selección múltiple)</label>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
          {ALLOWED_SIZES.map((sz) => {
            const active = selectedSet.has(sz.toUpperCase());
            return (
              <button
                type="button"
                key={sz}
                disabled={disabled}
                onClick={() => toggle(sz)}
                className={`text-xs border rounded px-2 py-1 font-medium transition select-none
                  ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-100 border-gray-300"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-pressed={active}
              >
                {sz}
              </button>
            );
          })}
        </div>
        {selected.length === 0 && (
          <p className="mt-1 text-[11px] text-gray-500">
            Selecciona una o varias tallas.
          </p>
        )}
        {selected.length > 0 && (
          <p className="mt-1 text-[11px] text-gray-500">
            Seleccionadas: {selected.join(", ")}
          </p>
        )}
      </div>
    );
  };

  // Inicializar form si recibimos producto (modo editar)
  useEffect(() => {
    if (!product) {
      setForm({ ...DEFAULT_FORM });
      setPreview(null);
      return;
    }

    setForm({
      id: product.id ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      // Normalizamos género para que coincida con las opciones del select (con tilde)
      genre: (() => {
        const raw = product.genre?.toLowerCase() ?? "unisex";
        if (raw === "nina") return "niña"; // backend podría mandar NINA
        if (raw === "nino") return "niño"; // backend podría mandar NINO
        return raw; // "niña" | "niño" | "unisex"
      })(),
      size: normalizeSizes(product.size), // ya devuelve en MAYÚSCULAS
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl ?? "",
      imagePublicId: product.imagePublicId ?? "",
    });
    setPreview(product.imageUrl ?? null);
  }, [product]);

  // Preview de imagen
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        setPreview(result);
        setForm((prev) => ({ ...prev, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
    return () => reader.abort?.();
  }, [file]);

  // ------------------ Handlers ------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validaciones
      if (!form.name.trim()) throw new Error("El nombre es obligatorio");
      if (isNaN(Number(form.price))) throw new Error("Precio inválido");
      if (isNaN(Number(form.stock))) throw new Error("Stock inválido");

      const payload = toServerProduct(form);

      if (mode === "edit" && form.id) {
        await updateProduct(form.id, payload, file || undefined);
      } else {
        await createProduct(payload, file || undefined);
      }

      router.push("/dashboard?option=products");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar producto"
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Render ------------------
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-bold mb-2">
        {mode === "edit" ? "Editar producto" : "Agregar nuevo producto"}
      </h2>
      <hr className="mb-5 border-gray-300" />

      {/* Imagen */}
      <div className="mb-3">
        {preview && (
          <div className="mb-3 flex justify-center">
            <div
              className="border-2 border-gray-300 bg-gray-50 rounded-lg p-2 shadow-inner flex items-center justify-center"
              style={{ minWidth: 120, minHeight: 120 }}
            >
              <Image
                src={preview}
                alt="Vista previa"
                width={160}
                height={160}
                unoptimized
                className="max-h-40 rounded object-contain w-auto h-auto"
                style={{ maxWidth: 160, maxHeight: 160 }}
              />
            </div>
          </div>
        )}

        <label className="block mb-1">Imagen (subir archivo)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded px-2 py-1 mb-2 disabled:opacity-50"
          disabled={loading}
        />
      </div>

      <InputField
        label="Nombre"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <InputField
        label="Descripción"
        name="description"
        value={form.description}
        onChange={handleChange}
        type="textarea"
        required
        disabled={loading}
      />
      <SelectField
        label="Categoría"
        value={form.genre}
        options={genres}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, genre: e.target.value }))
        }
        required
        disabled={loading}
      />
      <MultiSizeSelect
        value={form.size}
        disabled={loading}
        onChange={(val) => setForm((prev) => ({ ...prev, size: val }))}
      />
      <InputField
        label="Precio"
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <SelectField
        label="Stock"
        value={form.stock}
        options={stockOptions}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))
        }
        required
        disabled={loading}
      />

      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Aceptar"}
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => router.push("/dashboard?option=products")}
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
