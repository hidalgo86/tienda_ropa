"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

// Servicios
import {
  createProduct,
  updateProduct,
  canonicalizeSize,
} from "@/services/products.services";

// Tipos
import {
  ProductClient,
  ProductServer,
  ProductVariant,
} from "@/types/product.type";

// Componentes
import VariantRows from "./VariantRows";
import InputField from "./InputField";
import SelectField from "./SelectField";

// ------------------ Tipos del Formulario ------------------
interface FormProductProps {
  mode?: "create" | "edit";
  product?: ProductServer | null;
}

// ------------------ Valores por defecto ------------------
const DEFAULT_FORM: ProductClient = {
  id: "",
  name: "",
  genre: "unisex",
  description: "",
  variants: [{ size: "RN", price: 0, stock: 1 }], // usar formato backend
  imageUrl: "",
  imagePublicId: "",
};

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
  // Protección para SSR - window no existe en el servidor
  if (typeof window === "undefined") return "";

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
  return `data:image/svg+xml;base64,${window.btoa(
    unescape(encodeURIComponent(svg))
  )}`;
};

// Validación del formulario
function validateProductForm(form: ProductClient): ProductVariant[] {
  if (!form.name.trim()) throw new Error("El nombre es requerido");
  if (!form.genre) throw new Error("El género es requerido");

  const nonEmpty = form.variants.filter((v) => v.size);
  if (new Set(nonEmpty.map((v) => v.size)).size !== nonEmpty.length) {
    throw new Error("No se permiten variantes con tallas duplicadas");
  }
  if (nonEmpty.length === 0) {
    throw new Error("Debes agregar al menos una variante");
  }

  return nonEmpty;
}

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

  const normalizedGenre = ["niña", "niño", "unisex"].includes(form.genre)
    ? form.genre
    : "unisex";

  return {
    id: form.id || "", // Para creates será vacío, para updates tendrá valor
    name: form.name.trim(),
    description: form.description?.trim() || "",
    genre: normalizedGenre as "niña" | "niño" | "unisex",
    variants,
    ...(isUpdate
      ? {}
      : {
          imageUrl: form.imageUrl || "",
          imagePublicId: form.imagePublicId || "",
        }),
  };
};

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

  const genres = ["niña", "niño", "unisex"];

  // Optimización con useMemo para evitar recálculos innecesarios
  const totalStock = useMemo(
    () => computeTotalStock(form.variants),
    [form.variants]
  );
  const minPrice = useMemo(
    () => computeMinPrice(form.variants),
    [form.variants]
  );

  // Unificar la carga inicial de product con useMemo
  const initialForm = useMemo(() => {
    if (!product) return DEFAULT_FORM;

    const variants = product.variants?.map((v) => ({
      size: v?.size || "RN",
      stock: Number(v?.stock) || 0,
      price: Number(v?.price) || 0,
    })) ?? [{ size: "RN", price: 0, stock: 0 }];

    const mapGenre = (g: string) =>
      g.toLowerCase() === "nina"
        ? "niña"
        : g.toLowerCase() === "nino"
        ? "niño"
        : "unisex";

    return {
      ...DEFAULT_FORM,
      id: product.id ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      genre: mapGenre(product.genre ?? "unisex") as "niña" | "niño" | "unisex",
      variants,
      imageUrl: product.imageUrl ?? "",
      imagePublicId: product.imagePublicId ?? "",
    };
  }, [product]);

  // Inicializar form con el objeto memoizado
  useEffect(() => {
    setForm(initialForm);
    setPreview(product?.imageUrl ?? null);
  }, [initialForm, product?.imageUrl]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validación declarativa
      const nonEmpty = validateProductForm(form);

      const isUpdate = mode === "edit";
      const payload = toServerProduct(
        { ...form, variants: nonEmpty },
        isUpdate
      );

      // Manejo de archivos mejorado
      let fileToSend: File | null = file;

      // Solo generar placeholder si no hay archivo NI imagen existente Y es creación
      if (!file && !form.imageUrl && mode === "create") {
        const placeholderSvg = generatePlaceholderImage(form.name);
        // Solo procesar si se generó correctamente (no en SSR)
        if (placeholderSvg) {
          const response = await fetch(placeholderSvg);
          const blob = await response.blob();
          fileToSend = new File(
            [blob],
            `${form.name.replace(/\s+/g, "_")}_placeholder.svg`,
            { type: "image/svg+xml" }
          );
        }
      }

      // Para ediciones, solo enviar archivo si hay uno nuevo seleccionado
      if (mode === "edit" && !file) {
        fileToSend = null; // No enviar archivo si no hay uno nuevo
      }

      if (mode === "edit") {
        // Verificaciones adicionales para modo editar
        if (!form.id || !form.id.trim()) {
          throw new Error(
            "ID de producto no válido para actualización. Recargar la página e intentar de nuevo."
          );
        }

        await updateProduct(form.id, payload, fileToSend || undefined);
        toast.success("Producto actualizado correctamente");
      } else {
        await createProduct(payload, fileToSend || undefined);
        toast.success("Producto creado correctamente");
        // Reset rápido tras crear
        setForm({ ...DEFAULT_FORM });
        setFile(null);
        setPreview(null);
      }

      // Volver al listado después de un breve delay
      setTimeout(() => {
        router.push("/dashboard?option=products");
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al guardar el producto";
      toast.error(errorMessage);
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

      {/* Imagen con placeholder y botón de editar - PRIMER CAMPO */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-center">
          Imagen del producto
        </label>
        <div className="relative w-64 h-64 mx-auto">
          {/* Imagen o placeholder */}
          <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {preview ? (
              <Image
                src={preview}
                alt="Preview del producto"
                width={256}
                height={256}
                className="w-full h-full object-cover rounded-lg"
                unoptimized
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
        <span className="mr-4">Stock total: {totalStock}</span>
        <span>Precio mínimo: ${minPrice.toFixed(2)}</span>
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
