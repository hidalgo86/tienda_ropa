"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { MdCheckCircle, MdLocationOn, MdShoppingCart } from "react-icons/md";
import { useCartActions } from "@/lib/useCartActions";
import { checkoutCart } from "@/services/orders";
import {
  getCurrentUser,
  getStoredAuthToken,
  getStoredUser,
} from "@/services/users";
import { syncCart } from "@/store/slices/cartSlice";
import type { Order } from "@/types/domain/orders";
import type { User } from "@/types/domain/users";
import type { AppDispatch } from "@/store";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cart } = useCartActions();
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      router.replace("/login?redirect=%2Fcheckout");
      return;
    }

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser({ token });
        setUser(currentUser);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar tu cuenta";
        toast.error(message);
        router.replace("/account");
      } finally {
        setIsLoadingUser(false);
      }
    };

    void loadUser();
  }, [router]);

  const canCheckout = Boolean(user?.address?.trim()) && cart.items.length > 0;

  const orderSummary = useMemo(
    () =>
      cart.items.map((item) => ({
        key: `${item.id}-${item.selectedSize ?? ""}`,
        name: item.name,
        quantity: item.quantity,
        variant: item.selectedSize,
        price:
          (item.variants?.find(
            (variant) =>
              variant.name?.trim().toLowerCase() ===
              item.selectedSize?.trim().toLowerCase(),
          )?.price ??
            item.price ??
            0) * item.quantity,
      })),
    [cart.items],
  );

  const handleCheckout = async () => {
    if (!canCheckout) return;

    setIsSubmitting(true);

    try {
      const order = await checkoutCart();
      setCreatedOrder(order);
      dispatch(syncCart([]));
      toast.success("Compra completada");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo completar la compra";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Preparando checkout...</p>
        </div>
      </div>
    );
  }

  if (createdOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <MdCheckCircle className="mx-auto text-green-500" size={72} />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Pedido creado con exito
            </h1>
            <p className="mt-3 text-gray-600">
              Tu orden fue registrada correctamente y queda pendiente de pago.
            </p>

            <div className="mt-8 rounded-xl bg-gray-50 p-5 text-left">
              <p className="text-sm text-gray-500">Numero de orden</p>
              <p className="font-semibold text-gray-900">{createdOrder.id}</p>
              <p className="mt-4 text-sm text-gray-500">Total</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(createdOrder.totalAmount)}
              </p>
              <p className="mt-4 text-sm text-gray-500">Envio a</p>
              <p className="font-semibold text-gray-900">
                {createdOrder.shippingAddress.address}
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Seguir comprando
              </Link>
              <Link
                href="/account"
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ver mi cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">
            Revisa tu pedido y confirma la informacion de envio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-8">
          <section className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdLocationOn className="text-pink-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Datos de envio
                </h2>
              </div>

              <div className="space-y-2 text-sm sm:text-base">
                <p>
                  <span className="font-medium text-gray-900">Nombre:</span>{" "}
                  {user?.name?.trim() || "No registrado"}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Telefono:</span>{" "}
                  {user?.phone?.trim() || "No registrado"}
                </p>
                <p>
                  <span className="font-medium text-gray-900">Direccion:</span>{" "}
                  {user?.address?.trim() || "No registrada"}
                </p>
              </div>

              {!user?.address?.trim() && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Necesitas completar tu direccion en tu perfil antes de finalizar la compra.
                  <div className="mt-3">
                    <Link
                      href="/account"
                      className="inline-flex px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                    >
                      Completar perfil
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <MdShoppingCart className="text-blue-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">
                  Productos
                </h2>
              </div>

              {cart.items.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-gray-600">
                  Tu carrito esta vacio.
                  <div className="mt-3">
                    <Link
                      href="/products"
                      className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Ir a productos
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderSummary.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity}
                          {item.variant ? ` • Variante: ${item.variant}` : ""}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Resumen
              </h2>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Productos ({cart.totalItems})
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(cart.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envio</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(cart.totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout || isSubmitting}
                className="mt-6 w-full px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Procesando compra..." : "Confirmar compra"}
              </button>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="/cart"
                  className="text-center px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Volver al carrito
                </Link>
                <p className="text-xs text-gray-500 leading-relaxed">
                  El backend generara una orden pendiente y descontara el stock
                  disponible de los productos del carrito.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
