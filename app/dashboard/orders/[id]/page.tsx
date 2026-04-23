"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { listAdminOrders, type AdminOrder } from "@/services/orders";

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

export default function DashboardOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = useMemo(() => String(params?.id ?? "").trim(), [params]);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("Orden no valida");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await listAdminOrders({
          orderId,
          page: 1,
          limit: 1,
        });
        const matchedOrder = response.items[0] ?? null;

        if (!matchedOrder) {
          setError("No se encontro la orden solicitada");
          setOrder(null);
          return;
        }

        setOrder(matchedOrder);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el detalle de la orden",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando detalle de la orden...
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="space-y-4">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <MdArrowBack size={18} />
          Volver a ordenes
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error || "No se encontro la orden solicitada"}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <MdArrowBack size={18} />
        Volver a ordenes
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="break-all text-2xl font-bold text-slate-900">
              {order.id}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {order.user?.name?.trim() || order.user?.username || order.userId}
            </p>
            <p className="text-sm text-slate-500">
              {order.user?.email || "Sin email"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}
            >
              {order.status}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {order.paymentMethod}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total
            </div>
            <div className="mt-2 text-lg font-semibold text-slate-900">
              {formatCurrency(order.totalAmount)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Creada
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(order.createdAt)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pagada
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(order.paidAt)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Cancelada
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {formatDate(order.cancelledAt)}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Datos del cliente
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Usuario:</span>{" "}
                {order.user?.username || "Sin usuario"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Nombre:</span>{" "}
                {order.user?.name?.trim() || "No registrado"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Telefono:</span>{" "}
                {order.user?.phone?.trim() || "No registrado"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Rol:</span>{" "}
                {order.user?.role || "Sin rol"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Envio
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium text-slate-900">Direccion:</span>{" "}
                {order.shippingAddress.address}
              </p>
              <p>
                <span className="font-medium text-slate-900">Recibe:</span>{" "}
                {order.shippingAddress.name || "Sin nombre"}
              </p>
              <p>
                <span className="font-medium text-slate-900">Telefono:</span>{" "}
                {order.shippingAddress.phone || "Sin telefono"}
              </p>
              <p>
                <span className="font-medium text-slate-900">
                  Referencia de pago:
                </span>{" "}
                {order.paymentReference || "Sin referencia"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Productos de la orden
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, index) => (
              <div
                key={`${order.id}-${item.productId}-${index}`}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Cantidad: {item.quantity}
                    {item.variantName ? ` · Variante: ${item.variantName}` : ""}
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatCurrency(item.lineTotal)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
