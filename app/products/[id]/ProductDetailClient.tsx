"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { Product } from "@/types/product.type";
import { RootState } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/favoriteSlice";
import {
  MdArrowBack,
  MdShoppingCart,
  MdFavorite,
  MdFavoriteBorder,
  MdShare,
  MdAdd,
  MdRemove,
} from "react-icons/md";

interface ProductDetailClientProps {
  producto: Product;
  mode?: "public" | "admin";
}

export default function ProductDetailClient({
  producto,
  mode = "public",
}: ProductDetailClientProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const isAdminMode = mode === "admin";

  // Verificar si el producto está en favoritos
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.items.some((item) => item.id === producto.id),
  );

  // Inicializar con la primera talla disponible
  useState(() => {
    if (producto.variants && producto.variants.length > 0) {
      const firstAvailableSize =
        producto.variants.find((v) => (v.stock || 0) > 0)?.size ||
        producto.variants[0]?.size ||
        "";
      setSelectedSize(firstAvailableSize);
    }
  });

  const variants = producto.variants || [];
  const totalStock = variants.reduce(
    (sum, v) => sum + (Number(v?.stock) || 0),
    0,
  );
  const currentVariant = variants.find((v) => v.size === selectedSize);
  const displayPrice =
    currentVariant?.price ??
    (variants.length > 0
      ? Math.min(
          ...variants.map((v) => Number(v?.price) || 0).filter((n) => n > 0),
        )
      : 0);
  const availableStock = currentVariant?.stock || 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (availableStock === 0) {
      alert("No hay stock disponible para esta talla");
      return;
    }

    dispatch(
      addToCart({
        product: producto,
        quantity,
        selectedSize,
      }),
    );

    // Mostrar confirmación visual
    setShowAddedToCart(true);
    setTimeout(() => setShowAddedToCart(false), 2000);
  };

  const handleFavoriteToggle = () => {
    dispatch(toggleFavorite(producto));
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }
    if (availableStock === 0) {
      alert("No hay stock disponible para esta talla");
      return;
    }
    // TODO: Implementar compra directa
    console.log("Compra directa:", {
      producto: producto.id,
      size: selectedSize,
      quantity,
    });
    alert(
      `Redirigiendo a checkout (Talla: ${selectedSize}, Cantidad: ${quantity})`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
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

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                <Image
                  src={producto.imageUrl || "/placeholder.webp"}
                  alt={producto.name || "Producto"}
                  width={600}
                  height={600}
                  className="object-contain max-w-full max-h-full"
                  priority
                />
              </div>

              {/* Botones de acción secundarios */}
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
                    disabled={!selectedSize || availableStock === 0}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Agregar al carrito"
                    aria-label="Agregar al carrito"
                  >
                    <MdShoppingCart className="text-gray-600" size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Detalles del producto */}
            <div className="space-y-6">
              {/* Título y precio */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {producto.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-pink-600">
                    ${Number(displayPrice || 0).toFixed(2)}
                  </span>
                  {producto.status && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        producto.status.toLowerCase() === "disponible"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {producto.status.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Descripción */}
              {producto.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Descripción
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {producto.description}
                  </p>
                </div>
              )}

              {/* Información del producto */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Género:</span>
                  <span className="ml-2 text-gray-600">{producto.genre}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    Stock total:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {totalStock} unidades
                  </span>
                </div>
              </div>

              {/* Selector de tallas */}
              {variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Tallas disponibles
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {variants.map((variant) => {
                      const isSelected = selectedSize === variant.size;
                      const hasStock = (variant.stock || 0) > 0;

                      return (
                        <button
                          key={variant.size}
                          onClick={() =>
                            hasStock && setSelectedSize(variant.size)
                          }
                          disabled={!hasStock}
                          className={`
                            p-3 border rounded-lg text-sm font-medium transition-colors
                            ${
                              isSelected && hasStock
                                ? "border-pink-500 bg-pink-50 text-pink-700"
                                : hasStock
                                  ? "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            }
                          `}
                        >
                          <div>{variant.size}</div>
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
                        Talla seleccionada:{" "}
                        <span className="font-medium">{selectedSize}</span> -
                        Stock disponible:{" "}
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

              {!isAdminMode && (
                <>
                  {/* Selector de cantidad */}
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

                  {/* Botones de acción principales */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={handleBuyNow}
                      disabled={!selectedSize || availableStock === 0}
                      className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comprar ahora
                    </button>
                  </div>

                  {/* Notificación de agregado al carrito */}
                  {showAddedToCart && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
                      <div className="flex items-center gap-2 text-green-800">
                        <MdShoppingCart size={20} />
                        <span className="font-medium">
                          ¡Producto agregado al carrito!
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Información adicional */}
              <div className="pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>✓ Envío gratis en compras mayores a $50</p>
                  <p>✓ Devoluciones gratuitas dentro de 30 días</p>
                  <p>✓ Garantía de calidad 100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
