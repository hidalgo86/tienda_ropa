"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Product, ProductStatus } from "@/types/product.type";
import ProductListAdmin from "@/components/products/ProductListAdmin";
import Pagination from "@/components/Pagination";
import { useAdminProducts } from "./useAdminProducts";

const ProductsContent: React.FC = () => {
  // Dependencias de navegación para sincronizar estado <-> URL
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Valores válidos de estado para evitar filtros inválidos desde query params
  const validStatuses = useMemo(() => Object.values(ProductStatus), []);

  // Estado inicial tomado de URL (deep-link y recarga de página)
  const initialLimit = Number(searchParams.get("limit")) || 50;
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = validStatuses.includes(
    searchParams.get("status") as ProductStatus,
  )
    ? (searchParams.get("status") as ProductStatus)
    : ProductStatus.DISPONIBLE;
  const [limit] = useState(initialLimit);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [status, setStatus] = useState<ProductStatus>(initialStatus);

  // Controla acciones por tarjeta para prevenir doble click en delete/restore
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Hook encargado de datos, loading, errores y refetch de productos
  const { products, setProducts, totalPages, loading, error, refetch } =
    useAdminProducts({
      status,
      page,
      limit,
      search: debouncedSearch,
    });

  // Debounce de la búsqueda para evitar múltiples requests por tecla
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    // Escribe el estado actual en la URL sin recargar la página
    // (permite compartir link, refrescar y usar botón atrás)
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("status", status);
    params.set("limit", String(limit));
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
    const currentStatus =
      (searchParams.get("status") as ProductStatus | null) ||
      ProductStatus.DISPONIBLE;
    const currentLimit = Number(searchParams.get("limit")) || 50;
    const currentSearch = searchParams.get("search") || "";

    const mustUpdate =
      currentPage !== page ||
      currentStatus !== status ||
      currentLimit !== limit ||
      currentSearch !== debouncedSearch.trim();

    if (mustUpdate) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [page, status, limit, debouncedSearch, pathname, router, searchParams]);

  useEffect(() => {
    // Lee cambios de URL (ej. botón atrás/adelante) y actualiza estado local
    const nextPage = Math.max(1, Number(searchParams.get("page")) || 1);
    const rawStatus = searchParams.get("status") as ProductStatus | null;
    const nextStatus =
      rawStatus && validStatuses.includes(rawStatus)
        ? rawStatus
        : ProductStatus.DISPONIBLE;
    const nextSearch = searchParams.get("search") || "";

    setPage((prev) => (prev === nextPage ? prev : nextPage));
    setStatus((prev) => (prev === nextStatus ? prev : nextStatus));
    setSearch((prev) => (prev === nextSearch ? prev : nextSearch));
    setDebouncedSearch((prev) => (prev === nextSearch ? prev : nextSearch));
  }, [searchParams, validStatuses]);

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  // Función para eliminar producto
  const handleDelete = async (id: string) => {
    if (actionLoadingId === id) return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;

    setActionLoadingId(id);
    // Optimistic UI: removemos al instante para sensación de app rápida
    let previousProducts: Product[] = [];
    setProducts((prev) => {
      previousProducts = prev;
      return prev.filter((product) => product.id !== id);
    });

    try {
      const res = await fetch(`/api/products/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: ProductStatus.ELIMINADO }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          (data && (data.message || data.error)) ||
            "Error al eliminar producto",
        );

      // Refetch silencioso: valida consistencia sin mostrar spinner global
      await refetch({ silent: true }).catch(() => {
        return;
      });
    } catch (err) {
      // Rollback si falla el endpoint
      setProducts(previousProducts);
      alert(
        err instanceof Error ? err.message : "No se pudo eliminar el producto",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Función para restaurar producto
  const handleRestore = async (id: string) => {
    if (actionLoadingId === id) return;

    setActionLoadingId(id);
    // Optimistic UI: removemos de la vista actual y luego sincronizamos
    let previousProducts: Product[] = [];
    setProducts((prev) => {
      previousProducts = prev;
      return prev.filter((product) => product.id !== id);
    });

    try {
      const res = await fetch(`/api/products/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: ProductStatus.DISPONIBLE }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          (data && (data.message || data.error)) ||
            "Error al restaurar producto",
        );

      // Refetch silencioso para evitar parpadeo de loading general
      await refetch({ silent: true }).catch(() => {
        return;
      });
    } catch (err) {
      // Rollback si falla la restauración
      setProducts(previousProducts);
      alert(
        err instanceof Error ? err.message : "No se pudo restaurar el producto",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Función para editar producto (redirecciona a la página de edición)
  const handleEdit = (id: string) => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleStatusChange = (value: ProductStatus) => {
    // Evitar re-fetch doble y resetear página
    setPage(1);
    setStatus(value);
  };

  const handleSearchChange = (value: string) => {
    // Resetear página y aplicar debounce para requests
    setPage(1);
    setSearch(value);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => router.push("/dashboard/products/create")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm shadow flex items-center gap-2"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Añadir
        </button>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as ProductStatus)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="DISPONIBLE">Disponibles</option>
          <option value="AGOTADO">Agotados</option>
          <option value="ELIMINADO">Eliminados</option>
        </select>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full sm:w-64 md:w-80 lg:w-96 min-w-0"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
          <span className="text-gray-500">Cargando...</span>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No hay productos para mostrar.
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="mt-4 sm:mt-6">
            <ProductListAdmin
              products={products}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onRestore={handleRestore}
              actionLoadingId={actionLoadingId}
            />
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </>
  );
};

const ProductsPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
          <span className="text-gray-500">Cargando...</span>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
};

export default ProductsPage;
