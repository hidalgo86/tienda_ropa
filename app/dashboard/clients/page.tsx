"use client";

import Pagination from "@/components/Pagination";
import {
  listAdminUsers,
  updateAdminUserStatus,
  type PaginatedResult,
} from "@/services/users";
import type { User } from "@/types/domain/users";
import { useCallback, useEffect, useState } from "react";

const USER_STATUS_OPTIONS = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "suspendido", label: "Suspendido" },
  { value: "eliminado", label: "Eliminado" },
];

const formatDate = (value?: string | null): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(date);
};

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "activo":
      return "bg-green-100 text-green-700";
    case "inactivo":
      return "bg-gray-100 text-gray-700";
    case "suspendido":
      return "bg-amber-100 text-amber-700";
    case "eliminado":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function DashboardClientsPage() {
  const [usersPage, setUsersPage] = useState<PaginatedResult<User>>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listAdminUsers({
        page,
        limit: 12,
        username: debouncedSearch || undefined,
        status: status || undefined,
      });
      setUsersPage(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los clientes",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, status]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const handleStatusUpdate = async (userId: string, nextStatus: string) => {
    setUpdatingId(userId);

    try {
      const updatedUser = await updateAdminUserStatus(userId, nextStatus);
      setUsersPage((current) => ({
        ...current,
        items: current.items.map((user) =>
          user.id === userId ? updatedUser : user,
        ),
      }));
    } catch (updateError) {
      window.alert(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar el estado del cliente",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-600">
            Administra el estado y revisa la informacion principal de los
            usuarios registrados.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por usuario..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-72"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            {USER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Cargando clientes...
        </div>
      ) : usersPage.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No hay clientes para mostrar con esos filtros.
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {usersPage.items.map((user) => {
              const isBusy = updatingId === user.id;

              return (
                <article
                  key={user.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-slate-900">
                        {user.name?.trim() || user.username}
                      </h2>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500">
                        Usuario: {user.username}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="font-medium text-slate-900">Telefono</p>
                      <p>{user.phone?.trim() || "No registrado"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Verificacion</p>
                      <p>{user.isEmailVerified ? "Verificado" : "Pendiente"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="font-medium text-slate-900">Direccion</p>
                      <p>{user.address?.trim() || "No registrada"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Rol</p>
                      <p>{user.role}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Alta</p>
                      <p>{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-sm text-slate-600">
                      Estado del cliente
                    </label>
                    <select
                      value={user.status}
                      disabled={isBusy}
                      onChange={(event) =>
                        void handleStatusUpdate(user.id, event.target.value)
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-60"
                    >
                      {USER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.max(1, usersPage.totalPages)}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
