// src/app/dashboard/products/edit/[id]/page.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  legacyProductCategoryOptions,
  Product,
  ProductState,
  UploadProduct,
  VariantProduct,
  ProductStatus,
  Size,
  Genre,
  formatSizeLabel,
  getProductCategoryLabel,
  getVariantName,
  hasProductVariants,
  isClothingCategory,
  resolveCategoryOption,
} from "@/types/domain/products";
import type {
  ProductEditFormState,
  ProductVariantDraftValuesByIndex,
} from "@/types/ui/products";
import { PRODUCT_FORM_MAX_IMAGES } from "@/types/ui/products";
import {
  getProductById,
  updateProduct,
  uploadProductImage,
} from "@/services/products";
import { useCategories } from "@/services/categories/useCategories";

const EditProductPage: React.FC = () => {
  const router = useRouter();
  const { options } = useCategories();
  const categoryOptions = options.length
    ? options
    : legacyProductCategoryOptions;
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo =
    rawReturnTo && rawReturnTo.startsWith("/dashboard/products")
      ? rawReturnTo
      : "/dashboard/products";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductEditFormState>({});
  const [variantDraftValues, setVariantDraftValues] =
    useState<ProductVariantDraftValuesByIndex>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Función genérica para bloquear teclas inválidas
  const preventInvalidKeys = (
    e: React.KeyboardEvent<HTMLInputElement>,
    allowDecimal: boolean = false,
  ) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const invalidKeys = ["e", "E", "+", "-", ","];
    if (!allowDecimal) invalidKeys.push(".");
    if (invalidKeys.includes(e.key)) e.preventDefault();
  };

  // Abrir cámara
  const openCamera = () => {
    const input = cameraInputRef.current;
    if (!input) return;
    try {
      input.setAttribute("capture", "environment");
      input.setAttribute("accept", "image/*;capture=camera");
    } catch {}
    input.click();
  };

  // Cargar producto al montar
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then((data) => {
        const inferredCategory =
          resolveCategoryOption(data.categoryId, categoryOptions)?.value ||
          resolveCategoryOption(data.category, categoryOptions)?.value;
        setProduct(data);
        setForm({
          ...data,
          category: inferredCategory ?? data.category,
          variants: data.variants?.map((v) => ({ ...v })) || [],
        });

        // Inicializar draftValues para inputs
        const drafts: ProductVariantDraftValuesByIndex = {};
        data.variants?.forEach((v, idx) => {
          drafts[idx] = {
            stock: v.stock != null ? String(v.stock) : "",
            price: v.price != null ? String(v.price) : "",
          };
        });
        setVariantDraftValues(drafts);
      })
      .catch(() => setError("No se pudo cargar el producto"))
      .finally(() => setLoading(false));
  }, [categoryOptions, id]);

  // Generar preview de imágenes seleccionadas
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleImageSelection = (files: FileList | null) => {
    const incomingFiles = Array.from(files || []);
    if (!incomingFiles.length) return;

    const currentImagesCount = form.images?.length || 0;
    const availableSlots =
      PRODUCT_FORM_MAX_IMAGES - currentImagesCount - selectedFiles.length;

    if (availableSlots <= 0) {
      setError(`Máximo ${PRODUCT_FORM_MAX_IMAGES} imágenes permitidas.`);
      return;
    }

    const filesToAdd = incomingFiles.slice(0, availableSlots);
    if (filesToAdd.length < incomingFiles.length) {
      setError(`Solo puedes subir hasta ${PRODUCT_FORM_MAX_IMAGES} imágenes.`);
    } else {
      setError(null);
    }

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
  };

  const removeExistingImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
    setError(null);
  };

  // Manejar cambios de inputs generales
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "categoryId") {
      const selectedOption = resolveCategoryOption(value, categoryOptions);

      setForm((prev) => ({
        ...prev,
        categoryId: selectedOption?.categoryId || "",
        category: selectedOption?.value || prev.category,
        ...(selectedOption?.supportsGenre
          ? { stock: undefined, price: undefined }
          : { genre: undefined, variants: [] }),
      }));
      return;
    }

    if (name === "stock" || name === "price") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const resolvedCategoryId = String(
        form.categoryId ?? product?.categoryId ?? "",
      ).trim();
      if (!resolvedCategoryId) {
        throw new Error("No se pudo determinar el categoryId del producto");
      }

      let nextImages = form.images;
      if (selectedFiles.length > 0) {
        const uploadedImages = await Promise.all(
          selectedFiles.map((file) => uploadProductImage(file)),
        );

        nextImages = [...(form.images || []), ...uploadedImages];

        if (nextImages.length > PRODUCT_FORM_MAX_IMAGES) {
          throw new Error(
            `Máximo ${PRODUCT_FORM_MAX_IMAGES} imágenes permitidas.`,
          );
        }
      }

      if (!nextImages || nextImages.length === 0) {
        throw new Error("Agrega al menos una imagen");
      }

      const { status: formStatus, ...formWithoutStatus } = form;
      const payload: Partial<UploadProduct> = {
        ...formWithoutStatus,
        name: String(form.name || "").trim(),
        description: form.description ? String(form.description) : undefined,
        categoryId: resolvedCategoryId,
        images: nextImages,
        ...(formStatus === ProductStatus.ELIMINADO
          ? { state: ProductState.ELIMINADO }
          : {}),
      };

      if (
        hasProductVariants(form) ||
        hasProductVariants(product) ||
        form.genre ||
        product?.genre
      ) {
        if (!form.genre) {
          throw new Error("Selecciona un género para productos de ropa");
        }

        const normalizedVariants: VariantProduct[] = (form.variants || []).map(
          (variant, idx) => {
            const stockRaw = variantDraftValues[idx]?.stock ?? "";
            const priceRaw = variantDraftValues[idx]?.price ?? "";

            if (!/^\d+$/.test(stockRaw)) {
              throw new Error("Stock inválido: usa enteros no negativos");
            }
            if (!/^\d*\.?\d+$/.test(priceRaw)) {
              throw new Error("Precio inválido: usa números no negativos");
            }

            return {
              ...variant,
              name: getVariantName(variant),
              stock: Number(stockRaw),
              price: Number(priceRaw),
            };
          },
        );

        if (!normalizedVariants.length) {
          throw new Error(
            "Agrega al menos una variante (talla, stock y precio)",
          );
        }

        payload.genre = form.genre;
        payload.variants = normalizedVariants;
        payload.stock = undefined;
        payload.price = undefined;
      } else {
        const nextStock = Number(form.stock ?? product?.stock);
        const nextPrice = Number(form.price ?? product?.price);

        if (
          !Number.isFinite(nextStock) ||
          nextStock < 0 ||
          !Number.isInteger(nextStock)
        ) {
          throw new Error("Stock inválido: usa enteros no negativos");
        }

        if (!Number.isFinite(nextPrice) || nextPrice < 0) {
          throw new Error("Precio inválido: usa números no negativos");
        }

        payload.genre = undefined;
        payload.variants = undefined;
        payload.stock = nextStock;
        payload.price = nextPrice;
      }

      await updateProduct(id, payload);

      router.push(returnTo);
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

  const inferredCategory =
    resolveCategoryOption(
      form.categoryId ?? product.categoryId,
      categoryOptions,
    )?.value ||
    resolveCategoryOption(form.category ?? product.category, categoryOptions)
      ?.value;
  const resolvedCategory = getProductCategoryLabel(
    {
      category: inferredCategory ?? form.category ?? product.category,
      categoryId: form.categoryId ?? product.categoryId,
    },
    categoryOptions,
  );
  const isClothingProduct =
    isClothingCategory(
      form.categoryId ?? inferredCategory ?? form.category ?? product.category,
      categoryOptions,
    ) ||
    hasProductVariants(form) ||
    hasProductVariants(product) ||
    Boolean(form.genre || product.genre);
  const currentImagesCount = form.images?.length || 0;
  const totalSelectedCount = currentImagesCount + selectedFiles.length;
  const currentImageUrl =
    previewUrls[0] || form.images?.[0]?.url || product.images?.[0]?.url || "";

  return (
    <div className="max-w-xl mx-auto py-8">
      <button
        type="button"
        onClick={() => router.push(returnTo)}
        className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors mb-4"
      >
        <span aria-hidden="true">←</span>
        <span className="text-sm font-medium">Volver</span>
      </button>
      <div className="flex justify-center mb-6 relative">
        {currentImageUrl ? (
          <Image
            src={currentImageUrl}
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
            title="Subir desde galería"
            className="group relative bg-white/90 hover:bg-white text-emerald-600 hover:text-emerald-700 rounded-full p-3 shadow backdrop-blur"
            onClick={() => galleryInputRef.current?.click()}
          >
            📁
          </button>
          <button
            type="button"
            title="Tomar foto"
            className="group relative bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 rounded-full p-3 shadow backdrop-blur"
            onClick={openCamera}
          >
            📷
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar producto</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={galleryInputRef}
          onChange={(e) => {
            handleImageSelection(e.target.files);
            e.currentTarget.value = "";
          }}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={(e) => {
            handleImageSelection(e.target.files);
            e.currentTarget.value = "";
          }}
        />
        {currentImagesCount > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Imágenes actuales: {currentImagesCount} de{" "}
              {PRODUCT_FORM_MAX_IMAGES}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(form.images || []).map((image, idx) => (
                <div key={`${image.publicId}-${idx}`} className="relative">
                  <Image
                    src={image.url}
                    alt={`Imagen actual ${idx + 1}`}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                    onClick={() => removeExistingImage(idx)}
                    aria-label={`Quitar imagen actual ${idx + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Nuevas imágenes seleccionadas
            </p>
            <p className="text-xs text-gray-500">
              Se agregarán a las imágenes actuales al guardar.
            </p>
            <p className="text-xs text-gray-500">
              Total previsto: {totalSelectedCount} de {PRODUCT_FORM_MAX_IMAGES}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {previewUrls.map((preview, idx) => (
                <div key={`${preview}-${idx}`} className="relative">
                  <Image
                    src={preview}
                    alt={`Nueva imagen ${idx + 1}`}
                    width={96}
                    height={96}
                    className="w-24 h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                    onClick={() => {
                      setSelectedFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      );
                    }}
                    aria-label={`Quitar imagen ${idx + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
              onClick={() => setSelectedFiles([])}
            >
              Restablecer imágenes
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
        <input
          type="text"
          value={resolvedCategory}
          className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
          readOnly
        />

        {isClothingProduct ? (
          <>
            <select
              name="genre"
              value={form.genre || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Selecciona un género</option>
              <option value={Genre.NINA}>Niña</option>
              <option value={Genre.NINO}>Niño</option>
              <option value={Genre.UNISEX}>Unisex</option>
            </select>

            <div className="space-y-2">
              <label className="block font-semibold">Detalle por talla</label>
              <div className="grid grid-cols-[minmax(0,1fr)_80px_96px_32px] gap-2 items-center text-xs font-medium text-gray-600">
                <span>Talla</span>
                <span>Stock</span>
                <span>Precio</span>
                <span className="sr-only">Acción</span>
              </div>
              {(form.variants || []).map((variant, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={getVariantName(variant) || ""}
                    onChange={(e) => {
                      const value = e.target.value as VariantProduct["size"];
                      setForm((prev) => ({
                        ...prev,
                        variants: (prev.variants || []).map((v, i) =>
                          i === idx
                            ? { ...v, size: value, name: String(value || "") }
                            : v,
                        ),
                      }));
                    }}
                    className="border rounded px-2 py-1 flex-1"
                  >
                    <option value="">Talla</option>
                    {Object.values(Size).map((size) => {
                      const isUsed = form.variants?.some(
                        (v, i) => getVariantName(v) === size && i !== idx,
                      );
                      return (
                        <option key={size} value={size} disabled={isUsed}>
                          {formatSizeLabel(size)}
                        </option>
                      );
                    })}
                  </select>

                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={variantDraftValues[idx]?.stock || ""}
                    onKeyDown={(e) => preventInvalidKeys(e)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setVariantDraftValues((prev) => ({
                        ...prev,
                        [idx]: { ...prev[idx], stock: raw },
                      }));
                    }}
                    className="border rounded px-2 py-1 w-20"
                    placeholder="Stock"
                    required
                  />

                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={variantDraftValues[idx]?.price || ""}
                    onKeyDown={(e) => preventInvalidKeys(e, true)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setVariantDraftValues((prev) => ({
                        ...prev,
                        [idx]: { ...prev[idx], price: raw },
                      }));
                    }}
                    className="border rounded px-2 py-1 w-24"
                    placeholder="Precio"
                    required
                  />

                  <button
                    type="button"
                    className="text-red-600 font-bold px-2"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        variants: (prev.variants || []).filter(
                          (_, i) => i !== idx,
                        ),
                      }));
                      setVariantDraftValues((prev) => {
                        const next = { ...prev };
                        delete next[idx];
                        return next;
                      });
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => {
                  const usedSizes = (form.variants || []).map((v) =>
                    getVariantName(v),
                  );
                  const availableSize = Object.values(Size).find(
                    (size) => !usedSizes.includes(size),
                  );
                  if (!availableSize) return;
                  const nextIndex = (form.variants || []).length;
                  setForm((prev) => ({
                    ...prev,
                    variants: [
                      ...(prev.variants || []),
                      {
                        name: String(availableSize),
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
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Stock
              <input
                type="number"
                name="stock"
                value={form.stock ?? ""}
                onChange={handleChange}
                onKeyDown={(e) => preventInvalidKeys(e)}
                placeholder="Stock"
                min={0}
                step={1}
                inputMode="numeric"
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Precio
              <input
                type="number"
                name="price"
                value={form.price ?? ""}
                onChange={handleChange}
                onKeyDown={(e) => preventInvalidKeys(e, true)}
                placeholder="Precio"
                min={0}
                step="any"
                inputMode="decimal"
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </label>
          </div>
        )}

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
