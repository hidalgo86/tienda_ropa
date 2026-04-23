"use client";

import Link from "next/link";
import Pagination from "@/components/Pagination";
import {
  adminCancelOrder,
  adminPayOrder,
  listAdminOrders,
  type AdminOrder,
} from "@/services/orders";
import type { PaginatedResult } from "@/services/users";
import { useCallback, useEffect, useState } from "react";
import { MdChevronRight } from "react-icons/md";

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
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
};

export default function DashboardOrdersPage() {
  const [ordersPage, setOrdersPage] = useState<PaginatedResult<AdminOrder>>({
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
        limit: 12,
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

  const replaceOrder = (updatedOrder: AdminOrder) => {
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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ordenes</h1>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {ordersPage.total} ordenes
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-400 sm:w-56"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

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
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden xl:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Pago</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Creada</th>
                    <th className="px-4 py-3">Acciones</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ordersPage.items.map((order) => {
                    const isBusy = activeOrderId === order.id;
                    const isPending = order.status === "pending";

                    return (
                      <tr key={order.id} className="text-sm text-slate-700">
                        <td className="px-4 py-4">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="line-clamp-1 font-semibold text-slate-900 transition hover:text-pink-600"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-[220px]">
                            <div className="font-medium text-slate-900">
                              {order.user?.name?.trim() ||
                                order.user?.username ||
                                order.userId}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {order.user?.email || "Sin email"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {order.paymentMethod}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => void handlePay(order.id)}
                                  className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                                >
                                  {isBusy ? "Procesando..." : "Marcar pagada"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => void handleCancel(order.id)}
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                >
                                  {isBusy ? "Procesando..." : "Cancelar"}
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Sin acciones
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                          >
                            Ver detalle
                            <MdChevronRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 xl:hidden">
              {ordersPage.items.map((order) => {
                const isBusy = activeOrderId === order.id;
                const isPending = order.status === "pending";

                return (
                  <article key={order.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="block truncate font-semibold text-slate-900 transition hover:text-pink-600"
                        >
                          {order.id}
                        </Link>
                        <p className="mt-1 text-sm text-slate-600">
                          {order.user?.name?.trim() ||
                            order.user?.username ||
                            order.userId}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.user?.email || "Sin email"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Pago
                        </p>
                        <p className="mt-1">{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Total
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-700"
                      >
                        Ver detalle
                        <MdChevronRight size={18} />
                      </Link>

                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handlePay(order.id)}
                            className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                          >
                            {isBusy ? "Procesando..." : "Pagada"}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleCancel(order.id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            {isBusy ? "Procesando..." : "Cancelar"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
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
