"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MdCancel,
  MdCreditCard,
  MdInventory2,
  MdReceiptLong,
} from "react-icons/md";
import { cancelOrder, listMyOrders, payOrder } from "@/services/orders";
import { getStoredAuthToken } from "@/services/users";
import type { Order } from "@/types/domain/orders";
import {
  PAYMENTS_ENABLED,
  paymentsDisabledMessage,
} from "@/lib/commerceConfig";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

const formatDate = (value?: string | null): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const orderStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const orderStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  cancelled: "Cancelada",
};

export default function OrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const token = getStoredAuthToken();

    if (!token) {
      router.replace("/login?redirect=%2Forders");
      return;
    }

    try {
      const orderList = await listMyOrders({ token });
      setOrders(orderList);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar tus pedidos";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handlePayOrder = async (orderId: string) => {
    if (!PAYMENTS_ENABLED) {
      toast.error(paymentsDisabledMessage);
      return;
    }

    setActiveOrderId(orderId);

    try {
      const updatedOrder = await payOrder(orderId);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
      toast.success("Pedido marcado como pagado");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo pagar el pedido";
      toast.error(message);
    } finally {
      setActiveOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setActiveOrderId(orderId);

    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? updatedOrder : order)),
      );
      toast.success("Pedido cancelado");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cancelar el pedido";
      toast.error(message);
    } finally {
      setActiveOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MdReceiptLong className="text-pink-600" />
              Mis Pedidos
            </h1>
            <p className="mt-2 text-gray-600">
              Revisa el estado de tus compras y administra tus pedidos
              pendientes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadOrders()}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Actualizar
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg bg-white border border-gray-200 p-10 text-center shadow-sm">
            <MdInventory2 className="mx-auto text-gray-400" size={48} />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Todavia no has realizado compras
            </p>
            <p className="mt-2 text-gray-600">
              Cuando completes tu primer checkout, tus pedidos apareceran aqui.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isPending = order.status === "pending";
              const isBusy = activeOrderId === order.id;

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Pedido</p>
                      <p className="font-semibold text-gray-900 break-all">
                        {order.id}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Creado el {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          orderStatusStyles[order.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {orderStatusLabels[order.status] ?? order.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Envio</p>
                      <p className="text-gray-900 font-medium">
                        {order.shippingAddress.address}
                      </p>
                      <p className="text-gray-600">
                        {order.shippingAddress.name || "Sin nombre"}
                        {order.shippingAddress.phone
                          ? ` • ${order.shippingAddress.phone}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      {order.paymentReference && (
                        <p className="text-gray-600">
                          Ref: {order.paymentReference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.productId}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity}
                            {item.variantName
                              ? ` • Variante: ${item.variantName}`
                              : ""}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {isPending && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handlePayOrder(order.id)}
                        disabled={isBusy || !PAYMENTS_ENABLED}
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <MdCreditCard size={18} />
                        {!PAYMENTS_ENABLED
                          ? "Pago no disponible"
                          : isBusy
                            ? "Procesando..."
                            : "Marcar como pagada"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCancelOrder(order.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        <MdCancel size={18} />
                        {isBusy ? "Procesando..." : "Cancelar pedido"}
                      </button>
                    </div>
                  )}
                  {isPending && !PAYMENTS_ENABLED && (
                    <p className="mt-3 text-sm text-amber-700">
                      {paymentsDisabledMessage}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
