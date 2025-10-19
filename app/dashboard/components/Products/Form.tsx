"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/services/products.services";
import {
  ProductClient,
  ProductServer,
  ProductVariant,
} from "@/types/product.type";

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
  variants: [{ size: "RN", price: 0, stock: 0 }], // usar formato backend
  imageUrl: "",
  imagePublicId: "",
};

// ------------------ Input reutilizable ------------------
interface InputProps {
  label: string;
  name: "name" | "description"; // solo campos de nivel raíz
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
    <label className="block text-sm font-medium mb-1" htmlFor={String(name)}>
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        id={String(name)}
        name={name}
        value={String(value ?? "")}
        onChange={onChange}
        className="w-full border rounded px-2 py-1 disabled:opacity-50"
        required={required}
        disabled={disabled}
        rows={3}
      />
    ) : (
      <input
        id={String(name)}
        name={name}
        type={type}
        value={String(value)}
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
  name?: string;
  value: string | number;
  options: (string | number)[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

const SelectField = ({
  label,
  name,
  value,
  options,
  onChange,
  required,
  disabled = false,
}: SelectProps) => (
  <div className="mb-3">
    <label
      className="block text-sm font-medium mb-1"
      htmlFor={String(name ?? label)}
    >
      {label}
    </label>
    <select
      id={String(name ?? label)}
      name={name}
      value={String(value)}
      onChange={onChange}
      className="w-full border rounded px-2 py-1 disabled:opacity-50"
      required={required}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={String(opt)} value={String(opt)}>
          {String(opt)}
        </option>
      ))}
    </select>
  </div>
);

// ------------------ Helpers ------------------
// Enum Size del schema del backend: RN, 3M, 6M, 9M, 12M, 18M, 24M, 2T, 3T, ..., 12T
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

// Normaliza talla a formato backend (acepta 3M/M3 y 2T/T2 pero convierte al formato del backend)
function canonicalizeSize(raw: string): string {
  const s = String(raw || "")
    .trim()
    .toUpperCase();
  if (s === "RN") return "RN";

  // 3M o M3 -> 3M (formato backend)
  const m1 = /^(\d+)M$/.exec(s);
  if (m1) return `${m1[1]}M`;
  const m2 = /^M(\d+)$/.exec(s);
  if (m2) return `${m2[1]}M`;

  // 2T o T2 -> 2T (formato backend)
  const t1 = /^(\d+)T$/.exec(s);
  if (t1) return `${t1[1]}T`;
  const t2 = /^T(\d+)$/.exec(s);
  if (t2) return `${t2[1]}T`;

  return s;
}

// Convierte a formato backend (ya no necesita conversión porque canonicalizeSize ya lo hace)
function toRestSize(token: string): string {
  return canonicalizeSize(token);
}

// Derivados desde variants
function computeTotalStock(variants?: Array<{ stock: number }> | null): number {
  return (variants ?? []).reduce((sum, v) => sum + (Number(v?.stock) || 0), 0);
}
function computeMinPrice(variants?: Array<{ price: number }> | null): number {
  const prices = (variants ?? [])
    .map((v) => Number(v?.price))
    .filter((n) => Number.isFinite(n));
  if (prices.length === 0) return 0;
  return Math.min(...prices);
}

// Genera una imagen placeholder por defecto
const generatePlaceholderImage = (productName: string): string => {
  // Crear un SVG placeholder con el nombre del producto
  const initial = productName.charAt(0).toUpperCase() || "P";
  const svg = `
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#e5e7eb"/>
      <text x="150" y="150" text-anchor="middle" dy="0.35em" 
            font-family="Arial, sans-serif" font-size="80" fill="#9ca3af">
        ${initial}
      </text>
      <text x="150" y="220" text-anchor="middle" dy="0.35em" 
            font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        Sin imagen
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Construye payload para REST multipart
const toServerProduct = (
  form: ProductClient,
  isUpdate = false
): ProductServer => {
  const variants = (form.variants || [])
    .map((v) => ({
      size: canonicalizeSize(v.size), // ya devuelve formato backend (3M, 2T, etc.)
      stock: Math.max(0, Number(v.stock) || 0),
      price: Math.max(0, Number(v.price) || 0),
    }))
    .filter((v) => !!v.size);

  // El género ya debería estar en el formato correcto desde el form

  const payload = {
    name: form.name.trim(),
    description: form.description?.trim() || "",
    genre: form.genre,
  } as ProductServer;

  console.log("🔧 Género en form:", form.genre);
  console.log("🔧 Tipo del género:", typeof form.genre);

  // Asegurar que el género esté en el formato exacto que espera el backend
  const normalizedGenre =
    form.genre === "niña"
      ? "niña"
      : form.genre === "niño"
      ? "niño"
      : form.genre === "unisex"
      ? "unisex"
      : "unisex"; // fallback

  payload.genre = normalizedGenre;
  console.log("🔧 Género normalizado:", payload.genre);

  // Incluir variants siempre (tanto para create como para update)
  payload.variants = variants;

  // Para creates, incluir imágenes
  if (!isUpdate) {
    payload.imageUrl = form.imageUrl || "";
    payload.imagePublicId = form.imagePublicId || "";
  }

  console.log("🔧 Payload construido (isUpdate=" + isUpdate + "):", payload);
  console.log("🔧 Keys en payload:", Object.keys(payload));
  console.log("🔧 Variants incluidos:", variants);

  return payload;
};

// UI para filas de variantes
function VariantRows({
  variants,
  setVariants,
  disabled,
}: {
  variants: ProductVariant[];
  setVariants: (next: ProductVariant[]) => void;
  disabled: boolean;
}) {
  const addRow = () => {
    const used = new Set(variants.map((v) => v.size)); // ya no necesitamos canonicalizar
    const nextSize =
      ALLOWED_SIZES.find((s) => !used.has(s)) || ALLOWED_SIZES[0];
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
          disabled={disabled || variants.length >= ALLOWED_SIZES.length}
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
                {ALLOWED_SIZES.map((s) => {
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
                min={0}
                step="0.01"
                value={v.price}
                onChange={(e) =>
                  updateRow(idx, { price: Number(e.target.value) || 0 })
                }
                disabled={disabled}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                min={0}
                step="1"
                value={v.stock}
                onChange={(e) =>
                  updateRow(idx, {
                    stock: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                disabled={disabled}
                className="w-full border rounded px-2 py-1"
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
  // ya no usamos stockOptions globales; el stock es por variante

  // Eliminado MultiSizeSelect: ahora se editan variantes directamente

  // Inicializar form si recibimos producto (modo editar)
  useEffect(() => {
    console.log("🔄 useEffect inicialización", { product, mode });

    if (!product) {
      console.log("📝 Inicializando formulario vacío");
      setForm({ ...DEFAULT_FORM });
      setPreview(null);
      setFile(null);
      setError(null);
      return;
    }

    console.log("📦 Producto recibido:", product);

    const variantsFromProduct: ProductVariant[] = (product.variants || []).map(
      (v) => ({
        size: v?.size || "RN", // ya viene en formato backend, no necesitamos convertir
        stock: Number(v?.stock) || 0,
        price: Number(v?.price) || 0,
      })
    );

    console.log("🔄 Variants procesados:", variantsFromProduct);

    const genreRaw = product.genre;
    const genre =
      typeof genreRaw === "string"
        ? genreRaw === "nina" || genreRaw === "NINA"
          ? "niña"
          : genreRaw === "nino" || genreRaw === "NINO"
          ? "niño"
          : genreRaw === "unisex" || genreRaw === "UNISEX"
          ? "unisex"
          : genreRaw // mantener valor original si ya está correcto
        : // Si viene como enum GraphQL (NINA/NINO/UNISEX), mapear
        genreRaw === "NINA"
        ? "niña"
        : genreRaw === "NINO"
        ? "niño"
        : "unisex";

    const productId = product.id;
    console.log("🆔 ID del producto:", productId);

    const newForm = {
      ...DEFAULT_FORM,
      id: productId ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      genre: genre as "niña" | "niño" | "unisex",
      variants: variantsFromProduct.length
        ? variantsFromProduct
        : [{ size: "RN", price: 0, stock: 0 }], // usar formato backend
      imageUrl: product.imageUrl ?? "",
      imagePublicId: product.imagePublicId ?? "",
    };

    console.log("📋 Formulario inicializado:", newForm);

    setForm(newForm);
    setPreview(product.imageUrl ?? null);
    setError(null);
  }, [product, mode]);

  // Preview de imagen
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // ------------------ Handlers ------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as {
      name: "name" | "description";
      value: string;
    };
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      genre: e.target.value as "niña" | "niño" | "unisex",
    }));
  };

  // No hay stock global; el stock se edita por variante

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log("🚀 Iniciando handleSubmit", { mode, formId: form.id });

    try {
      // Validaciones rápidas
      if (!form.name.trim()) throw new Error("El nombre es requerido");
      if (!form.genre) throw new Error("El género es requerido");

      const nonEmpty = (form.variants || []).filter((v) => v.size);
      console.log("📦 Variants no vacíos:", nonEmpty);

      // sin duplicados de talla
      const normalizedSizes = nonEmpty.map((v) => v.size); // ya viene normalizado
      const uniqueCount = new Set(normalizedSizes).size;
      if (uniqueCount !== nonEmpty.length) {
        throw new Error("No se permiten variantes con tallas duplicadas");
      }
      if (nonEmpty.length === 0)
        throw new Error("Debes agregar al menos una variante");

      const isUpdate = mode === "edit";
      const payload = toServerProduct(
        { ...form, variants: nonEmpty },
        isUpdate
      );
      console.log("📄 Payload generado:", payload);

      // Manejo de archivos mejorado
      let fileToSend: File | null = file;

      // Solo generar placeholder si no hay archivo NI imagen existente Y es creación
      if (!file && !form.imageUrl && mode === "create") {
        console.log("🖼️ Generando imagen placeholder para nuevo producto");
        const placeholderSvg = generatePlaceholderImage(form.name);
        const response = await fetch(placeholderSvg);
        const blob = await response.blob();
        fileToSend = new File(
          [blob],
          `${form.name.replace(/\s+/g, "_")}_placeholder.svg`,
          { type: "image/svg+xml" }
        );
      }

      // Para ediciones, solo enviar archivo si hay uno nuevo seleccionado
      if (mode === "edit" && !file) {
        fileToSend = null; // No enviar archivo si no hay uno nuevo
        console.log(
          "📁 Editando sin archivo nuevo - manteniendo imagen existente"
        );
      }

      console.log(
        "📁 Archivo a enviar:",
        fileToSend ? fileToSend.name : "ninguno"
      );

      if (mode === "edit") {
        console.log("✏️ Modo editar detectado");

        // Verificaciones adicionales para modo editar
        if (!form.id || !form.id.trim()) {
          throw new Error(
            "ID de producto no válido para actualización. Recargar la página e intentar de nuevo."
          );
        }

        console.log("✏️ Actualizando producto con ID:", form.id);
        console.log("📄 Payload completo:", JSON.stringify(payload, null, 2));
        console.log(
          "📄 Payload keys antes de updateProduct:",
          Object.keys(payload)
        );
        console.log("📄 ¿Tiene variants?:", "variants" in payload);

        const result = await updateProduct(
          form.id,
          payload,
          fileToSend || undefined
        );
        console.log("✅ Resultado actualización:", result);
        alert("✅ Producto actualizado correctamente");
      } else {
        console.log("🆕 Creando nuevo producto");
        const result = await createProduct(payload, fileToSend || undefined);
        console.log("✅ Resultado creación:", result);
        alert("✅ Producto creado correctamente");

        // Reset rápido tras crear
        setForm({ ...DEFAULT_FORM });
        setFile(null);
        setPreview(null);
      }

      // Volver al listado
      console.log("🔄 Redirigiendo al listado");
      router.push("/dashboard?option=products");
      router.refresh();
    } catch (err: unknown) {
      console.error("❌ Error en handleSubmit:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al guardar el producto";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      {/* Información de debug */}
      {mode === "edit" && (
        <div className="p-2 rounded bg-blue-50 text-blue-700 text-sm">
          <strong>Modo Editar</strong> - ID: {form.id || "No ID"} | Producto:{" "}
          {form.name || "Sin nombre"}
        </div>
      )}

      {error && (
        <div className="p-2 rounded bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Imagen con placeholder y botón de editar - PRIMER CAMPO */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-center">
          Imagen del producto
        </label>
        <div className="relative w-64 h-64 mx-auto">
          {/* Imagen o placeholder */}
          <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Preview del producto"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400 p-4">
                {form.name ? (
                  <>
                    <div className="w-20 h-20 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-500">
                        {form.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                      {form.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Placeholder</p>
                  </>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-16 w-16 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">Sin imagen</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Botón de editar (lápiz) */}
          <button
            type="button"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/jpeg,image/png,image/webp";
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const f = target.files?.[0] || null;
                setFile(f);
              };
              input.click();
            }}
            disabled={disabled}
            className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cambiar imagen"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          {/* Botón para quitar imagen (solo si hay preview que no sea la imagen original) */}
          {preview && preview !== form.imageUrl && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(form.imageUrl || null);
              }}
              disabled={disabled}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors disabled:opacity-50"
              title="Quitar imagen nueva"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-2">
          {preview
            ? "Haz clic en el lápiz para cambiar la imagen"
            : "Haz clic en el lápiz para agregar una imagen o se generará una automáticamente"}
        </p>
      </div>

      <InputField
        label="Nombre"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        disabled={disabled}
      />

      <InputField
        label="Descripción"
        name="description"
        value={form.description}
        type="textarea"
        onChange={handleChange}
        disabled={disabled}
      />

      <SelectField
        label="Género"
        name="genre"
        value={form.genre}
        options={genres}
        onChange={handleGenreChange}
        required
        disabled={disabled}
      />

      <VariantRows
        variants={form.variants}
        setVariants={(next) => setForm((p) => ({ ...p, variants: next }))}
        disabled={disabled}
      />

      {/* Resumen de derivados */}
      <div className="text-sm text-gray-600">
        <span className="mr-4">
          Stock total: {computeTotalStock(form.variants)}
        </span>
        <span>Precio mínimo: ${computeMinPrice(form.variants).toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
        </button>
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={() => router.push("/dashboard?option=products")}
          disabled={disabled}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
