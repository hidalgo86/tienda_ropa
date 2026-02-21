"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UploadProduct,
  VariantProduct,
  Size,
  Genre,
} from "@/types/product.type";

const CreateProductPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UploadProduct>>({
    name: "",
    genre: undefined,
    description: "",
    variants: [] as VariantProduct[],
  });
  // Estado para la imagen y su previsualización
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const openCamera = () => {
    const input = cameraInputRef.current;
    if (!input) return;
    try {
      input.setAttribute("capture", "environment");
      input.setAttribute("accept", "image/*;capture=camera");
    } catch {}
    input.click();
  };
  // Estado para variantes temporales
  type VariantDraft = { size: Size; stock: number | ""; price: number | "" };
  const [variant, setVariant] = useState<VariantDraft>({
    size: Size.RN,
    stock: "",
    price: "",
  });
  const [variantErrors, setVariantErrors] = useState<{
    stock?: string;
    price?: string;
  }>({});
  const preventStockInvalidKeys = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  const preventPriceInvalidKeys = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (["e", "E", "+", "-", ","].includes(e.key)) {
      e.preventDefault();
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  // Manejar cambios en los campos de variante
  const handleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "stock") {
      if (value !== "" && !/^\d+$/.test(value)) {
        setVariantErrors((prev) => ({
          ...prev,
          stock: "Stock: solo enteros no negativos",
        }));
        return;
      }
      setVariantErrors((prev) => ({ ...prev, stock: undefined }));
    }

    if (name === "price") {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
        setVariantErrors((prev) => ({
          ...prev,
          price: "Precio: solo números no negativos",
        }));
        return;
      }
      setVariantErrors((prev) => ({ ...prev, price: undefined }));
    }

    setVariant((prev) => ({
      ...prev,
      [name]:
        name === "size"
          ? (value as Size)
          : name === "stock"
            ? value === ""
              ? ""
              : Number(value)
            : name === "price"
              ? value === ""
                ? ""
                : Number(value)
              : Number(value),
    }));
  };

  // Agregar variante a la lista
  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !variant.size ||
      variant.stock === "" ||
      variant.stock < 0 ||
      !Number.isInteger(variant.stock) ||
      variant.price === "" ||
      variant.price < 0
    ) {
      setVariantErrors({
        stock:
          variant.stock === "" ||
          variant.stock < 0 ||
          !Number.isInteger(variant.stock)
            ? "Stock: solo enteros no negativos"
            : undefined,
        price:
          variant.price === "" || variant.price < 0
            ? "Precio: solo números no negativos"
            : undefined,
      });
      return;
    }
    setForm((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          ...variant,
          size: variant.size as Size,
          stock: Number(variant.stock),
          price: Number(variant.price),
        },
      ],
    }));
    setVariant({ size: Size.RN, stock: "", price: "" });
    setVariantErrors({});
  };

  // Eliminar variante
  const handleRemoveVariant = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== idx),
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!image) {
        throw new Error("Selecciona una imagen desde galería o cámara");
      }

      // Validación: al menos una variante
      if (!form.variants || form.variants.length === 0) {
        throw new Error("Agrega al menos una variante (talla, stock y precio)");
      }

      const res = await fetch(`/api/products/create`, {
        method: "POST",
        body: createFormData(),
      });
      if (!res.ok) {
        let msg = "Error al crear producto";
        try {
          const data = await res.json();
          msg =
            typeof data?.error === "string"
              ? data.error
              : JSON.stringify(data?.error ?? data);
        } catch {}
        throw new Error(msg);
      }
      router.push("/dashboard/products");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el producto",
      );
    }
    setLoading(false);
  };
  const createFormData = () => {
    const formData = new FormData();
    // Agregar campos del formulario
    for (const key in form) {
      if (key === "variants") {
        formData.append("variants", JSON.stringify(form.variants || []));
      } else {
        const value = form[key as keyof UploadProduct];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      }
    }
    // Agregar imagen
    if (image) {
      formData.append("image", image);
    }
    return formData;
  };

  // Limpiar URL de previsualización para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Crear nuevo producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={galleryInputRef}
          onChange={handleImageChange}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={handleImageChange}
        />
        {/* Previsualización de imagen o esqueleto */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-40 h-40">
            <div className="w-40 h-40 bg-gray-100 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Previsualización"
                  width={160}
                  height={160}
                  className="object-cover w-full h-full"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                type="button"
                aria-label="Subir desde galería"
                title="Subir desde galería"
                className="group relative bg-white/90 hover:bg-white text-emerald-600 hover:text-emerald-700 rounded-full p-2 shadow backdrop-blur"
                onClick={() => galleryInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    galleryInputRef.current?.click();
                  }
                }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                  Galería
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4zm3.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM4 17l4.5-4.5 3 3L15 12l5 5H4z" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Tomar foto"
                title="Tomar foto"
                className="group relative bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full p-2 shadow backdrop-blur"
                onClick={openCamera}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCamera();
                  }
                }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                  Cámara
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.25 4.5a1.75 1.75 0 0 0-1.49.833L6.86 6.75H5A2.75 2.75 0 0 0 2.25 9.5v7A2.75 2.75 0 0 0 5 19.25h14A2.75 2.75 0 0 0 21.75 16.5v-7A2.75 2.75 0 0 0 19 6.75h-1.86l-.9-1.417A1.75 1.75 0 0 0 14.75 4.5h-5.5Zm2.75 11.75a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          {image && (
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
              onClick={() => {
                setImage(null);
                setImagePreview(null);
                if (galleryInputRef.current) galleryInputRef.current.value = "";
                if (cameraInputRef.current) cameraInputRef.current.value = "";
              }}
            >
              Quitar imagen
            </button>
          )}
        </div>
        <input
          type="text"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder="Nombre del producto"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Descripción del producto"
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <select
          name="genre"
          value={form.genre || ""}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        >
          <option value="" disabled>
            Selecciona un género
          </option>
          <option value={Genre.NINO}>Niño</option>
          <option value={Genre.NINA}>Niña</option>
          <option value={Genre.UNISEX}>Unisex</option>
        </select>

        {/* Variantes (tallas, stock, precio) */}
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-1">Detalle por talla</h2>
          <p className="text-xs text-gray-600 mb-2">
            Completa Talla, Stock y Precio para cada registro.
          </p>
          <div className="flex gap-2 mb-1 text-xs font-medium text-gray-600">
            <span className="w-1/3">Talla</span>
            <span className="w-1/3">Stock</span>
            <span className="w-1/3">Precio</span>
            <span className="sr-only">Acción</span>
          </div>
          <div className="flex gap-2 mb-2 items-end">
            <select
              name="size"
              value={variant.size}
              onChange={handleVariantChange}
              className="p-2 border border-gray-300 rounded w-1/3"
            >
              <option value="" disabled>
                Selecciona talla
              </option>
              {Object.values(Size).map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="stock"
              value={variant.stock}
              onChange={handleVariantChange}
              onKeyDown={preventStockInvalidKeys}
              placeholder="Stock"
              min={0}
              step={1}
              inputMode="numeric"
              className="p-2 border border-gray-300 rounded w-1/3"
            />
            <input
              type="number"
              name="price"
              value={variant.price}
              onChange={handleVariantChange}
              onKeyDown={preventPriceInvalidKeys}
              placeholder="Precio"
              min={0}
              step="any"
              inputMode="decimal"
              className="p-2 border border-gray-300 rounded w-1/3"
            />
            <button
              onClick={handleAddVariant}
              className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              type="button"
            >
              Agregar
            </button>
          </div>
          <div className="mb-2 space-y-1">
            <p
              className={`text-xs ${
                variantErrors.stock ? "text-red-600" : "text-gray-500"
              }`}
            >
              {variantErrors.stock || "Stock: solo enteros no negativos"}
            </p>
            <p
              className={`text-xs ${
                variantErrors.price ? "text-red-600" : "text-gray-500"
              }`}
            >
              {variantErrors.price ||
                "Precio: números enteros o decimales no negativos"}
            </p>
          </div>
          {/* Lista de variantes agregadas */}
          <ul className="space-y-1">
            {(form.variants || []).map((v, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <span className="font-mono">
                  Talla: {v.size}, Stock: {v.stock}, Precio: ${v.price}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Producto"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default CreateProductPage;
