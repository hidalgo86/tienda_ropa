"use client";

import Pagination from "@/components/Pagination";
import {
  adminCancelOrder,
  adminPayOrder,
  listAdminOrders,
} from "@/services/orders";
import type { Order } from "@/types/domain/orders";
import type { PaginatedResult } from "@/services/users";
import { useCallback, useEffect, useState } from "react";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
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

const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendientes" },
  { value: "paid", label: "Pagadas" },
  { value: "cancelled", label: "Canceladas" },
];

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

export default function DashboardOrdersPage() {
  const [ordersPage, setOrdersPage] = useState<PaginatedResult<Order>>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listAdminOrders({
        page,
        limit: 10,
        status: status || undefined,
      });
      setOrdersPage(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las ordenes",
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const replaceOrder = (updatedOrder: Order) => {
    setOrdersPage((current) => ({
      ...current,
      items: current.items.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    }));
  };

  const handlePay = async (orderId: string) => {
    setActiveOrderId(orderId);

    try {
      replaceOrder(await adminPayOrder(orderId));
    } catch (actionError) {
      window.alert(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo marcar la orden como pagada",
      );
    } finally {
      setActiveOrderId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    setActiveOrderId(orderId);

    try {
      replaceOrder(await adminCancelOrder(orderId));
    } catch (actionError) {
      window.alert(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo cancelar la orden",
      );
    } finally {
      setActiveOrderId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ordenes</h1>
          <p className="text-sm text-slate-600">
            Visualiza el historial de compras y administra el estado de pago de
            cada pedido.
          </p>
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-56"
        >
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando ordenes...
        </div>
      ) : ordersPage.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No hay ordenes para mostrar.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {ordersPage.items.map((order) => {
              const isBusy = activeOrderId === order.id;
              const isPending = order.status === "pending";

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Orden
                      </p>
                      <h2 className="break-all text-sm font-semibold text-slate-900">
                        {order.id}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Cliente:{" "}
                        {order.user?.name?.trim() ||
                          order.user?.username ||
                          order.userId}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.user?.email || "Sin email"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {order.paymentMethod}
                      </span>
                      <span className="text-lg font-bold text-sky-700">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                    <div>
                      <p className="font-medium text-slate-900">Envio</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.name || "Sin nombre"}
                        {order.shippingAddress.phone
                          ? ` - ${order.shippingAddress.phone}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Fechas</p>
                      <p>Creada: {formatDate(order.createdAt)}</p>
                      <p>Pagada: {formatDate(order.paidAt)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.productId}-${index}`}
                        className="flex flex-col gap-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.productName}
                          </p>
                          <p>
                            Cantidad: {item.quantity}
                            {item.variantName
                              ? ` - Variante: ${item.variantName}`
                              : ""}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(item.lineTotal)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {isPending && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handlePay(order.id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {isBusy ? "Procesando..." : "Marcar como pagada"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleCancel(order.id)}
                        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        {isBusy ? "Procesando..." : "Cancelar orden"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.max(1, ordersPage.totalPages)}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
