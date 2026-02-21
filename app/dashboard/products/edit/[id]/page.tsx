"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  Product,
  UploadProduct,
  VariantProduct,
  ProductStatus,
} from "@/types/product.type";

const EditProductPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UploadProduct>>({});
  const [variantFieldErrors, setVariantFieldErrors] = useState<
    Record<number, { stock?: string; price?: string }>
  >({});
  const [variantDraftValues, setVariantDraftValues] = useState<
    Record<number, { stock: string; price: string }>
  >({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
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

  const openCamera = () => {
    const input = cameraInputRef.current;
    if (!input) return;
    // Refuerza atributos para maximizar compatibilidad (iOS/Android)
    try {
      input.setAttribute("capture", "environment");
      // Sugerir cámara directa en navegadores que lo soportan
      input.setAttribute("accept", "image/*;capture=camera");
    } catch {}
    input.click();
  };

  // En componente cliente, usar rutas relativas (mismo origen)

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/get/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setForm({ ...data });
        const drafts = ((data?.variants || []) as VariantProduct[]).reduce<
          Record<number, { stock: string; price: string }>
        >((acc, variant, idx) => {
          acc[idx] = {
            stock:
              variant?.stock !== undefined && variant?.stock !== null
                ? String(variant.stock)
                : "",
            price:
              variant?.price !== undefined && variant?.price !== null
                ? String(variant.price)
                : "",
          };
          return acc;
        }, {});
        setVariantDraftValues(drafts);
      })
      .catch(() => setError("No se pudo cargar el producto"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const normalizedVariants = (
        (form.variants || []) as VariantProduct[]
      ).map((variant, idx) => {
        const stockRaw = variantDraftValues[idx]?.stock ?? "";
        const priceRaw = variantDraftValues[idx]?.price ?? "";

        if (!/^\d+$/.test(stockRaw)) {
          throw new Error("Stock inválido: usa enteros no negativos");
        }
        if (!/^\d*\.?\d+$/.test(priceRaw)) {
          throw new Error(
            "Precio inválido: usa números enteros o decimales no negativos",
          );
        }

        return {
          ...variant,
          stock: Number(stockRaw),
          price: Number(priceRaw),
        };
      });

      // Determinar status según stock total de variantes
      const totalStock = normalizedVariants.reduce(
        (sum, v) => sum + (Number(v?.stock) || 0),
        0,
      );
      const nextStatus: ProductStatus =
        totalStock > 0 ? ProductStatus.DISPONIBLE : ProductStatus.AGOTADO;

      let res: Response;
      if (selectedFile) {
        // Requiere oldImagePublicId para borrar en Cloudinary
        const oldImagePublicId =
          form.imagePublicId || product?.imagePublicId || "";
        if (!oldImagePublicId) {
          throw new Error("Falta el id de la imagen anterior");
        }

        const fd = new FormData();
        fd.append("id", id);
        fd.append("oldImagePublicId", oldImagePublicId);
        fd.append("image", selectedFile);
        if (form.name) fd.append("name", String(form.name));
        if (form.genre) fd.append("genre", String(form.genre));
        if (form.description !== undefined && form.description !== null) {
          fd.append("description", String(form.description));
        }
        // Enviar status calculado por stock
        fd.append("status", String(nextStatus));
        if (normalizedVariants) {
          fd.append("variants", JSON.stringify(normalizedVariants));
        }

        res = await fetch(`/api/products/update/${id}`, {
          method: "PATCH",
          body: fd,
        });
      } else {
        res = await fetch(`/api/products/update/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          // Enviar status calculado por stock
          body: JSON.stringify({
            ...form,
            variants: normalizedVariants,
            status: nextStatus,
            id,
          }),
        });
      }
      if (!res.ok) throw new Error("Error al actualizar producto");
      router.push("/dashboard/products");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el producto",
      );
    }
  };

  if (loading) return <div className="py-10 text-center">Cargando...</div>;
  if (error)
    return <div className="py-10 text-center text-red-600">{error}</div>;
  if (!product)
    return <div className="py-10 text-center">Producto no encontrado</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex justify-center mb-6">
        <div className="relative">
          {previewUrl || form.imageUrl ? (
            <Image
              src={previewUrl || String(form.imageUrl)}
              alt={form.name || "Imagen del producto"}
              width={224}
              height={224}
              className="max-h-56 rounded shadow object-contain"
            />
          ) : (
            <div className="h-56 w-56 bg-gray-100 rounded shadow flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              type="button"
              aria-label="Subir desde galería"
              title="Subir desde galería"
              className="group relative bg-white/90 hover:bg-white text-emerald-600 hover:text-emerald-700 rounded-full p-3 shadow backdrop-blur"
              onClick={() => galleryInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  galleryInputRef.current?.click();
                }
              }}
            >
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                Subir desde galería
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
              className="group relative bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full p-3 shadow backdrop-blur"
              onClick={openCamera}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openCamera();
                }
              }}
            >
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                Tomar foto
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
      </div>
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Inputs ocultos para galería y cámara */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={galleryInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
          }}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);
          }}
        />
        {selectedFile && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Nueva imagen seleccionada: {selectedFile.name}
            </p>
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                if (galleryInputRef.current) galleryInputRef.current.value = "";
                if (cameraInputRef.current) cameraInputRef.current.value = "";
              }}
            >
              Restablecer imagen
            </button>
          </div>
        )}
        <input
          type="text"
          name="name"
          value={form.name || ""}
          onChange={handleChange}
          placeholder="Nombre"
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          placeholder="Descripción"
          className="w-full border rounded px-3 py-2"
        />
        <select
          name="genre"
          value={form.genre || ""}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Selecciona un género</option>
          <option value="NINA">Niña</option>
          <option value="NINO">Niño</option>
          <option value="UNISEX">Unisex</option>
        </select>

        {/* Edición de variantes (tallas) */}
        <div className="space-y-2">
          <label className="block font-semibold">Detalle por talla</label>
          <p className="text-xs text-gray-600">
            Ajusta Talla, Stock y Precio en cada fila.
          </p>
          <div className="flex gap-2 items-center text-xs font-medium text-gray-600">
            <span className="flex-1">Talla</span>
            <span className="w-20">Stock</span>
            <span className="w-24">Precio</span>
            <span className="w-8 sr-only">Acción</span>
          </div>
          {(form.variants || []).map((variant, idx) => (
            <React.Fragment key={idx}>
              <div className="flex gap-2 items-center">
                <select
                  name={`variant-size-${idx}`}
                  value={variant.size || ""}
                  onChange={(e) => {
                    const value = e.target.value as VariantProduct["size"];
                    setForm((prev) => ({
                      ...prev,
                      variants: (prev.variants || []).map((v, i) =>
                        i === idx ? { ...v, size: value } : v,
                      ),
                    }));
                  }}
                  className="border rounded px-2 py-1 flex-1"
                  required
                >
                  <option value="">Talla</option>
                  {[
                    "RN",
                    "M3",
                    "M6",
                    "M9",
                    "M12",
                    "M18",
                    "M24",
                    "T2",
                    "T3",
                    "T4",
                    "T5",
                    "T6",
                    "T7",
                    "T8",
                    "T9",
                    "T10",
                    "T12",
                  ].map((size) => {
                    const isUsed = form.variants?.some(
                      (v, i) => v.size === size && i !== idx,
                    );
                    return (
                      <option key={size} value={size} disabled={isUsed}>
                        {size}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="number"
                  min="0"
                  step={1}
                  inputMode="numeric"
                  name={`variant-stock-${idx}`}
                  value={
                    variantDraftValues[idx]?.stock ??
                    String(variant.stock ?? "")
                  }
                  onKeyDown={preventStockInvalidKeys}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw !== "" && !/^\d+$/.test(raw)) {
                      setVariantFieldErrors((prev) => ({
                        ...prev,
                        [idx]: {
                          ...prev[idx],
                          stock: "Stock: solo enteros no negativos",
                        },
                      }));
                      return;
                    }
                    setVariantDraftValues((prev) => ({
                      ...prev,
                      [idx]: {
                        stock: raw,
                        price: prev[idx]?.price ?? String(variant.price ?? ""),
                      },
                    }));
                    setVariantFieldErrors((prev) => ({
                      ...prev,
                      [idx]: {
                        ...prev[idx],
                        stock: undefined,
                      },
                    }));
                    if (raw !== "") {
                      const value = Number(raw);
                      setForm((prev) => ({
                        ...prev,
                        variants: (prev.variants || []).map((v, i) =>
                          i === idx ? { ...v, stock: value } : v,
                        ),
                      }));
                    }
                  }}
                  className="border rounded px-2 py-1 w-20"
                  placeholder="Stock"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  name={`variant-price-${idx}`}
                  value={
                    variantDraftValues[idx]?.price ??
                    String(variant.price ?? "")
                  }
                  onKeyDown={preventPriceInvalidKeys}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) {
                      setVariantFieldErrors((prev) => ({
                        ...prev,
                        [idx]: {
                          ...prev[idx],
                          price: "Precio: solo números no negativos",
                        },
                      }));
                      return;
                    }
                    setVariantDraftValues((prev) => ({
                      ...prev,
                      [idx]: {
                        stock: prev[idx]?.stock ?? String(variant.stock ?? ""),
                        price: raw,
                      },
                    }));
                    setVariantFieldErrors((prev) => ({
                      ...prev,
                      [idx]: {
                        ...prev[idx],
                        price: undefined,
                      },
                    }));
                    if (raw !== "") {
                      const value = Number(raw);
                      setForm((prev) => ({
                        ...prev,
                        variants: (prev.variants || []).map((v, i) =>
                          i === idx ? { ...v, price: value } : v,
                        ),
                      }));
                    }
                  }}
                  className="border rounded px-2 py-1 w-24"
                  placeholder="Precio"
                  required
                />
                <button
                  type="button"
                  className="text-red-600 font-bold px-2"
                  onClick={() => {
                    setVariantDraftValues((prev) => {
                      const next: Record<
                        number,
                        { stock: string; price: string }
                      > = {};
                      Object.entries(prev).forEach(([key, value]) => {
                        const keyNumber = Number(key);
                        if (keyNumber < idx) next[keyNumber] = value;
                        if (keyNumber > idx) next[keyNumber - 1] = value;
                      });
                      return next;
                    });
                    setVariantFieldErrors((prev) => {
                      const next: Record<
                        number,
                        { stock?: string; price?: string }
                      > = {};
                      Object.entries(prev).forEach(([key, value]) => {
                        const keyNumber = Number(key);
                        if (keyNumber < idx) next[keyNumber] = value;
                        if (keyNumber > idx) next[keyNumber - 1] = value;
                      });
                      return next;
                    });
                    setForm((prev) => ({
                      ...prev,
                      variants: (prev.variants || []).filter(
                        (_, i) => i !== idx,
                      ),
                    }));
                  }}
                  title="Eliminar variante"
                >
                  ×
                </button>
              </div>
              <div className="-mt-1 mb-1 space-y-1">
                <p
                  className={`text-xs ${
                    variantFieldErrors[idx]?.stock
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {variantFieldErrors[idx]?.stock ||
                    "Stock: solo enteros no negativos"}
                </p>
                <p
                  className={`text-xs ${
                    variantFieldErrors[idx]?.price
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {variantFieldErrors[idx]?.price ||
                    "Precio: números enteros o decimales no negativos"}
                </p>
              </div>
            </React.Fragment>
          ))}
          <button
            type="button"
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => {
              // Añadir una nueva variante con talla no usada
              const usedSizes = (form.variants || []).map((v) => v.size);
              const allSizes = [
                "RN",
                "M3",
                "M6",
                "M9",
                "M12",
                "M18",
                "M24",
                "T2",
                "T3",
                "T4",
                "T5",
                "T6",
                "T7",
                "T8",
                "T9",
                "T10",
                "T12",
              ];
              const availableSize = allSizes.find(
                (size) => !usedSizes.includes(size as VariantProduct["size"]),
              );
              if (!availableSize) return;
              const nextIndex = (form.variants || []).length;
              setForm((prev) => ({
                ...prev,
                variants: [
                  ...(prev.variants || []),
                  {
                    size: availableSize as VariantProduct["size"],
                    stock: 0,
                    price: 0,
                  },
                ],
              }));
              setVariantDraftValues((prev) => ({
                ...prev,
                [nextIndex]: { stock: "0", price: "0" },
              }));
            }}
          >
            + Añadir talla
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
