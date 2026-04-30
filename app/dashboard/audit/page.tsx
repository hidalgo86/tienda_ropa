"use client";

import Pagination from "@/components/Pagination";
import { listAdminAuditLogs } from "@/services/audit";
import {
  getStoredAuthToken,
  type PaginatedResult,
} from "@/services/users";
import type { AuditLog, AuditLogFilters } from "@/types/domain/audit";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { MdRefresh, MdSearch } from "react-icons/md";

const INITIAL_FILTERS: AuditLogFilters = {
  actorUserId: "",
  action: "",
  entityType: "",
  entityId: "",
};

const formatDate = (value?: string | null): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const normalizeAuditPage = (
  response: Partial<PaginatedResult<AuditLog>> | null | undefined,
): PaginatedResult<AuditLog> => ({
  items: Array.isArray(response?.items) ? response.items : [],
  total: Number(response?.total) || 0,
  page: Math.max(1, Number(response?.page) || 1),
  totalPages: Math.max(1, Number(response?.totalPages) || 1),
});

const compactId = (value?: string | null): string => {
  if (!value) return "Sin dato";
  return value.length > 18 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
};

const badgeClass = (action: string): string => {
  const normalizedAction = action.toLowerCase();

  if (normalizedAction.includes("delete") || normalizedAction.includes("cancel")) {
    return "bg-red-50 text-red-700";
  }

  if (normalizedAction.includes("create") || normalizedAction.includes("register")) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalizedAction.includes("update") || normalizedAction.includes("pay")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
};

export default function DashboardAuditPage() {
  const [auditPage, setAuditPage] = useState<PaginatedResult<AuditLog>>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<AuditLogFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<AuditLogFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeItems = Array.isArray(auditPage.items) ? auditPage.items : [];
  const safeTotalPages = Math.max(1, Number(auditPage.totalPages) || 1);
  const safeTotal = Number(auditPage.total) || 0;

  const hasFilters = useMemo(
    () =>
      Object.values(appliedFilters).some(
        (value) => typeof value === "string" && value.trim(),
      ),
    [appliedFilters],
  );

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!getStoredAuthToken()) {
        setAuditPage(normalizeAuditPage(null));
        return;
      }

      const response = await listAdminAuditLogs({
        ...appliedFilters,
        page,
        limit: 15,
      });
      setAuditPage(normalizeAuditPage(response));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las auditorias",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    void loadAuditLogs();
  }, [loadAuditLogs]);

  useEffect(() => {
    const handleSessionChanged = () => {
      if (!getStoredAuthToken()) {
        setAuditPage(normalizeAuditPage(null));
        setLoading(false);
        setError(null);
      }
    };

    window.addEventListener("auth:session-changed", handleSessionChanged);

    return () => {
      window.removeEventListener("auth:session-changed", handleSessionChanged);
    };
  }, []);

  const updateFilter = (key: keyof AuditLogFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Auditorias</h1>
            <p className="mt-1 text-sm text-slate-500">
              Consulta acciones registradas por trazabilidad del backend.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAuditLogs()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            disabled={loading}
          >
            <MdRefresh size={18} />
            Actualizar
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              Usuario
              <input
                value={filters.actorUserId ?? ""}
                onChange={(event) => updateFilter("actorUserId", event.target.value)}
                placeholder="ID de usuario"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none transition focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              Accion
              <input
                value={filters.action ?? ""}
                onChange={(event) => updateFilter("action", event.target.value)}
                placeholder="create, update..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none transition focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              Entidad
              <input
                value={filters.entityType ?? ""}
                onChange={(event) => updateFilter("entityType", event.target.value)}
                placeholder="Product, Order..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none transition focus:border-slate-500"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              ID entidad
              <input
                value={filters.entityId ?? ""}
                onChange={(event) => updateFilter("entityId", event.target.value)}
                placeholder="ID afectado"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal outline-none transition focus:border-slate-500"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {safeTotal} registros
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleClear}
                disabled={!hasFilters && !Object.values(filters).some(Boolean)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <MdSearch size={18} />
                Buscar
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando auditorias...
        </div>
      ) : safeItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No hay auditorias para mostrar.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden xl:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Accion</th>
                    <th className="px-4 py-3">Entidad</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">IP anonimizada</th>
                    <th className="px-4 py-3">Request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeItems.map((log) => (
                    <tr key={log.id} className="text-sm text-slate-700">
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(log.action)}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {log.entityType}
                        </div>
                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {compactId(log.entityId)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono text-xs text-slate-700">
                          {compactId(log.actorUserId)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {log.actorRole || "Sin rol"}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {log.ip || "Sin IP"}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">
                        {compactId(log.requestId)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 xl:hidden">
              {safeItems.map((log) => (
                <article key={log.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {log.entityType}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {compactId(log.entityId)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Fecha
                      </p>
                      <p className="mt-1">{formatDate(log.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Actor
                      </p>
                      <p className="mt-1 font-mono text-xs">
                        {compactId(log.actorUserId)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        IP anonimizada
                      </p>
                      <p className="mt-1">{log.ip || "Sin IP"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Request
                      </p>
                      <p className="mt-1 font-mono text-xs">
                        {compactId(log.requestId)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={safeTotalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
