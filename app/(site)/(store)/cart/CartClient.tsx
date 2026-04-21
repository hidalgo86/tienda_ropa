"use client";

import Link from "next/link";
import Image from "next/image";
import { MdDelete, MdDeleteSweep, MdAdd, MdRemove, MdShoppingBag } from "react-icons/md";
import { useState } from "react";
import { findVariantBySelection, formatVariantLabel } from "@/types/domain/products";
import { useCartActions } from "@/lib/useCartActions";
import { getStoredAuthToken } from "@/services/users";

export default function CartClient() {
  const { cart, changeCartItemQuantity, removeCartItem, clearAllCart } =
    useCartActions();
  const { items, totalItems, totalPrice } = cart;
  const [isClearing, setIsClearing] = useState(false);
  const isAuthenticated = Boolean(getStoredAuthToken());

  const handleQuantityChange = (
    productId: string,
    newQuantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    void changeCartItemQuantity({
      productId,
      quantity: newQuantity,
      selectedSize,
      selectedColor,
    });
  };

  const handleRemoveItem = (
    productId: string,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    void removeCartItem({ productId, selectedSize, selectedColor });
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    setTimeout(() => {
      void clearAllCart().finally(() => setIsClearing(false));
    }, 300);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MdShoppingBag className="text-blue-500" />
              Mi Carrito
            </h1>
            <p className="text-gray-600 mt-1">
              {totalItems > 0
                ? `${totalItems} ${totalItems === 1 ? "producto" : "productos"} en tu carrito`
                : "Tu carrito esta vacio"}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={isClearing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <MdDeleteSweep size={18} />
              {isClearing ? "Limpiando..." : "Limpiar carrito"}
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            {isAuthenticated
              ? "Tu carrito esta vinculado a tu cuenta."
              : "Tu carrito se guarda en este dispositivo. Al iniciar sesion se sincronizara con tu cuenta."}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-20 lg:py-24">
            <div className="max-w-md mx-auto">
              <div className="text-6xl sm:text-7xl lg:text-8xl mb-6">🛒</div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                Tu carrito esta vacio
              </h2>
              <p className="text-gray-600 mb-8">
                Explora nuestros productos y agrega los que mas te gusten al carrito.
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Explorar productos
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const variantPrice = findVariantBySelection(
                  item.variants,
                  item.selectedSize,
                )?.price;
                const itemPrice = Number(variantPrice ?? item.price ?? 0);
                const itemTotal = itemPrice * item.quantity;
                const itemImage = item.images?.[0]?.url || "/placeholder.webp";

                return (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-24 h-32 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={itemImage}
                          alt={item.name || "Producto"}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                              {item.name || "Producto sin nombre"}
                            </h3>

                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.selectedSize && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  Variante: {formatVariantLabel(item.selectedSize)}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                            </div>

                            <p className="text-blue-600 font-semibold mt-2">
                              {formatPrice(itemPrice)} c/u
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleRemoveItem(
                                item.id,
                                item.selectedSize,
                                item.selectedColor,
                              )
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Cantidad:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    Math.max(0, item.quantity - 1),
                                    item.selectedSize,
                                    item.selectedColor,
                                  )
                                }
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                disabled={item.quantity <= 1}
                              >
                                <MdRemove size={16} />
                              </button>

                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1,
                                    item.selectedSize,
                                    item.selectedColor,
                                  )
                                }
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                              >
                                <MdAdd size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formatPrice(itemTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen del pedido
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Productos ({totalItems})</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envio</span>
                    <span className="font-medium text-green-600">Gratis</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full block text-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Proceder al pago
                  </Link>
                  <Link
                    href="/products"
                    className="w-full block text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
