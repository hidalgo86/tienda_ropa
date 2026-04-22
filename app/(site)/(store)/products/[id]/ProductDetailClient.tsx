"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import {
  findVariantBySelection,
  formatGenreLabel,
  formatVariantLabel,
  getProductCategoryLabel,
  getProductStatusLabel,
  getProductStock,
  getVariantName,
  hasProductVariants,
  legacyProductCategoryOptions,
} from "@/types/domain/products";
import type { ProductDetailClientProps } from "@/types/ui/products";
import { useCategories } from "@/services/categories/useCategories";
import { RootState } from "@/store";
import { useCartActions } from "@/lib/useCartActions";
import { useFavoriteActions } from "@/lib/useFavoriteActions";
import {
  MdAdd,
  MdArrowBack,
  MdFavorite,
  MdFavoriteBorder,
  MdRemove,
  MdShare,
  MdShoppingCart,
} from "react-icons/md";
import {
  PAYMENTS_ENABLED,
  paymentsDisabledMessage,
} from "@/lib/commerceConfig";

const sizePattern = /^(RN|M3|M6|M9|M12|M18|M24|T2|T3|T4|T5|T6|T7|T8|T9|T10|T12)$/i;

export default function ProductDetailClient({
  producto,
  mode = "public",
}: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const isAdminMode = mode === "admin";
  const isRopa = hasProductVariants(producto) || Boolean(producto.genre);
  const { options } = useCategories();
  const { addProductToCart } = useCartActions();
  const { toggleProductFavorite } = useFavoriteActions();
  const categoryOptions = options.length
    ? options
    : legacyProductCategoryOptions;

  const images =
    Array.isArray(producto.images) && producto.images.length > 0
      ? producto.images
      : [{ url: "/placeholder.webp", publicId: "placeholder" }];
  const selectedImage = images[selectedImageIndex] || images[0];

  const isFavorite = useSelector((state: RootState) =>
    state.favorites.items.some((item) => item.id === producto.id),
  );

  useEffect(() => {
    setSelectedImageIndex(0);
    if (isRopa && producto.variants && producto.variants.length > 0) {
      const firstAvailableSize =
        getVariantName(producto.variants.find((v) => (v.stock || 0) > 0)) ||
        getVariantName(producto.variants[0]) ||
        "";
      setSelectedSize(firstAvailableSize);
      return;
    }
    setSelectedSize("");
  }, [isRopa, producto.id, producto.variants]);

  const variants = producto.variants || [];
  const totalStock = isRopa
    ? variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0)
    : Number(producto.stock || 0);
  const currentVariant = isRopa
    ? findVariantBySelection(variants, selectedSize)
    : null;
  const displayPrice = isRopa
    ? (currentVariant?.price ??
      (variants.length > 0
        ? Math.min(
            ...variants.map((v) => Number(v?.price) || 0).filter((n) => n > 0),
          )
        : 0))
    : Number(producto.price || 0);
  const availableStock = isRopa
    ? currentVariant?.stock || 0
    : Number(producto.stock || 0);
  const displayGenre = formatGenreLabel(producto.genre);
  const displayStatus = getProductStatusLabel(producto);
  const displayCategory = getProductCategoryLabel(producto, categoryOptions);
  const hasOnlySizeVariants =
    variants.length > 0 &&
    variants.every((variant) =>
      sizePattern.test(String(variant.name || variant.size || "").trim()),
    );
  const productModeLabel = !hasProductVariants(producto)
    ? "Simple"
    : hasOnlySizeVariants
      ? "Ropa"
      : "Variantes";
  const productModeDetail = !hasProductVariants(producto)
    ? `Stock total: ${getProductStock(producto)}`
    : hasOnlySizeVariants
      ? `${variants.length} talla(s)`
      : `${variants.length} variante(s)`;

  const handleAddToCart = () => {
    if (isRopa && !selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (availableStock === 0) {
      alert(
        isRopa
          ? "No hay stock disponible para esta talla"
          : "No hay stock disponible",
      );
      return;
    }

    void addProductToCart({
      product: producto,
      quantity,
      selectedSize: isRopa ? selectedSize : undefined,
    });

    setShowAddedToCart(true);
    setTimeout(() => setShowAddedToCart(false), 2000);
  };

  const handleFavoriteToggle = () => {
    void toggleProductFavorite(producto);
  };

  const handleBuyNow = () => {
    if (!PAYMENTS_ENABLED) {
      alert(paymentsDisabledMessage);
      return;
    }
    if (isRopa && !selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (availableStock === 0) {
      alert(
        isRopa
          ? "No hay stock disponible para esta talla"
          : "No hay stock disponible",
      );
      return;
    }

    console.log("Compra directa:", {
      producto: producto.id,
      size: isRopa ? selectedSize : null,
      quantity,
    });
    alert(
      isRopa
        ? `Redirigiendo a checkout (Talla: ${selectedSize}, Cantidad: ${quantity})`
        : `Redirigiendo a checkout (Cantidad: ${quantity})`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-2">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
            onClick={() =>
              isAdminMode ? router.push("/dashboard/products") : router.back()
            }
          >
            <MdArrowBack size={20} />
            <span className="text-sm font-medium">Volver</span>
          </button>
          {isAdminMode && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  router.push(`/dashboard/products/edit/${producto.id}`)
                }
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Editar producto
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                <Image
                  src={selectedImage.url}
                  alt={producto.name || "Producto"}
                  width={600}
                  height={600}
                  className="object-contain max-w-full max-h-full"
                  priority
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => {
                    const isSelected = idx === selectedImageIndex;
                    return (
                      <button
                        key={`${img.publicId}-${idx}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 ${
                          isSelected
                            ? "border-pink-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        aria-label={`Ver imagen ${idx + 1}`}
                      >
                        <Image
                          src={img.url}
                          alt={`${producto.name} miniatura ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {!isAdminMode && (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleFavoriteToggle}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={
                      isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                    }
                  >
                    {isFavorite ? (
                      <MdFavorite className="text-red-500" size={20} />
                    ) : (
                      <MdFavoriteBorder className="text-gray-600" size={20} />
                    )}
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <MdShare className="text-gray-600" size={20} />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={(isRopa && !selectedSize) || availableStock === 0}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Agregar al carrito"
                    aria-label="Agregar al carrito"
                  >
                    <MdShoppingCart className="text-gray-600" size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {producto.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-pink-600">
                    ${Number(displayPrice || 0).toFixed(2)}
                  </span>
                  {displayStatus && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        displayStatus === "disponible"
                          ? "bg-green-100 text-green-800"
                          : displayStatus === "agotado"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {displayStatus}
                    </span>
                  )}
                </div>
                {isAdminMode && (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {productModeLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {productModeDetail}
                    </span>
                  </div>
                )}
              </div>

              {producto.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Descripcion
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {producto.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Categoria:</span>
                  <span className="ml-2 text-gray-600">
                    {displayCategory || "Sin categoria"}
                  </span>
                </div>
                {!isRopa && (
                  <div>
                    <span className="font-medium text-gray-900">Stock:</span>
                    <span className="ml-2 text-gray-600">
                      {totalStock} unidades
                    </span>
                  </div>
                )}
                {!isRopa && (
                  <div>
                    <span className="font-medium text-gray-900">Precio:</span>
                    <span className="ml-2 text-gray-600">
                      ${Number(displayPrice || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {isRopa && (
                  <div>
                    <span className="font-medium text-gray-900">Genero:</span>
                    <span className="ml-2 text-gray-600">
                      {displayGenre || "Sin genero"}
                    </span>
                  </div>
                )}
                {isAdminMode && producto.sku && (
                  <div>
                    <span className="font-medium text-gray-900">SKU:</span>
                    <span className="ml-2 text-gray-600">{producto.sku}</span>
                  </div>
                )}
                {isAdminMode && (
                  <div>
                    <span className="font-medium text-gray-900">
                      Stock total:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {getProductStock(producto)} unidades
                    </span>
                  </div>
                )}
              </div>

              {isRopa && variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Variantes disponibles
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {variants.map((variant) => {
                      const variantName = getVariantName(variant);
                      const isSelected = selectedSize === variantName;
                      const hasStock = (variant.stock || 0) > 0;

                      return (
                        <button
                          key={variantName}
                          onClick={() =>
                            hasStock && setSelectedSize(variantName)
                          }
                          disabled={!hasStock}
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            isSelected && hasStock
                              ? "border-pink-500 bg-pink-50 text-pink-700"
                              : hasStock
                                ? "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <div>{formatVariantLabel(variant)}</div>
                          <div className="text-xs text-gray-500">
                            {hasStock ? `(${variant.stock})` : "Agotado"}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSize && currentVariant && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Variante seleccionada:{" "}
                        <span className="font-medium">
                          {formatVariantLabel(selectedSize)}
                        </span>{" "}
                        - Stock disponible:{" "}
                        <span className="font-medium">
                          {currentVariant.stock}
                        </span>{" "}
                        - Precio:{" "}
                        <span className="font-medium text-pink-600">
                          ${Number(currentVariant.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAdminMode && variants.length > 0 && !hasOnlySizeVariants && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Resumen de variantes
                  </h3>
                  <div className="space-y-2">
                    {variants.map((variant) => (
                      <div
                        key={getVariantName(variant)}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                      >
                        <div className="font-medium text-gray-800">
                          {getVariantName(variant)}
                        </div>
                        <div className="text-gray-600">
                          Stock: {variant.stock} · $
                          {Number(variant.price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isAdminMode && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Cantidad
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <MdRemove size={18} />
                      </button>
                      <span className="w-16 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(Math.min(availableStock, quantity + 1))
                        }
                        disabled={quantity >= availableStock}
                        className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <MdAdd size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleBuyNow}
                      disabled={
                        !PAYMENTS_ENABLED ||
                        (isRopa && !selectedSize) ||
                        availableStock === 0
                      }
                      className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {PAYMENTS_ENABLED ? "Comprar ahora" : "Compra no disponible"}
                    </button>
                    {!PAYMENTS_ENABLED && (
                      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        {paymentsDisabledMessage}
                      </p>
                    )}
                  </div>

                  {showAddedToCart && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
                      <div className="flex items-center gap-2 text-green-800">
                        <MdShoppingCart size={20} />
                        <span className="font-medium">
                          Producto agregado al carrito
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Entrega y condiciones sujetas a disponibilidad.</p>
                  <p>Revisa stock y variantes antes de confirmar la compra.</p>
                  <p>Si tienes dudas, consulta el detalle antes de editar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
