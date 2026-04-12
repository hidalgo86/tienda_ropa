"use client";
import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ADMIN_PRODUCT_FILTER_ALL,
  AdminProductFilter,
  Product,
  ProductAvailability,
  ProductState,
  parseAdminProductFilter,
} from "@/types/product.type";
import ProductListAdmin from "@/components/products/ProductListAdmin";
import Pagination from "@/components/Pagination";
import { useAdminProducts } from "./useAdminProducts";
import { updateProduct } from "@/services/products";

const ProductsContent: React.FC = () => {
  // Dependencias de navegación para sincronizar estado <-> URL
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado inicial tomado de URL (deep-link y recarga de página)
  const initialLimit = Number(searchParams.get("limit")) || 50;
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const initialSearch = searchParams.get("search") || "";
  const initialFilter =
    parseAdminProductFilter(searchParams.get("status")) ||
    ADMIN_PRODUCT_FILTER_ALL;
  const [limit] = useState(initialLimit);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [filter, setFilter] = useState<AdminProductFilter>(initialFilter);

  // Controla acciones por tarjeta para prevenir doble click en delete/restore
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Hook encargado de datos, loading, errores y refetch de productos
  const { products, setProducts, totalPages, loading, error, refetch } =
    useAdminProducts({
      filter,
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
    params.set("limit", String(limit));
    if (filter !== ADMIN_PRODUCT_FILTER_ALL) {
      params.set("status", filter);
    }
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (currentQuery !== nextQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }
  }, [page, filter, limit, debouncedSearch, pathname, router, searchParams]);

  useEffect(() => {
    // Lee cambios de URL (ej. botón atrás/adelante) y actualiza estado local
    const nextPage = Math.max(1, Number(searchParams.get("page")) || 1);
    const nextStatus =
      parseAdminProductFilter(searchParams.get("status")) ||
      ADMIN_PRODUCT_FILTER_ALL;
    const nextSearch = searchParams.get("search") || "";

    setPage((prev) => (prev === nextPage ? prev : nextPage));
    setFilter((prev) => (prev === nextStatus ? prev : nextStatus));
    setSearch((prev) => (prev === nextSearch ? prev : nextSearch));
    setDebouncedSearch((prev) => (prev === nextSearch ? prev : nextSearch));
  }, [searchParams]);

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
      await updateProduct(id, { state: ProductState.ELIMINADO });

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
      await updateProduct(id, { state: ProductState.ACTIVO });

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
    const currentQuery = searchParams.toString();
    const returnTo = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;
    router.push(
      `/dashboard/products/edit/${id}?returnTo=${encodeURIComponent(returnTo)}`,
    );
  };

  const handleStatusChange = (value: AdminProductFilter) => {
    // Evitar re-fetch doble y resetear página
    setPage(1);
    setFilter(value);
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
          value={filter}
          onChange={(e) =>
            handleStatusChange(e.target.value as AdminProductFilter)
          }
          className="border rounded px-3 py-2 text-sm"
        >
          <option value={ADMIN_PRODUCT_FILTER_ALL}>Todos</option>
          <option value={ProductAvailability.DISPONIBLE}>Disponibles</option>
          <option value={ProductAvailability.AGOTADO}>Agotados</option>
          <option value={ProductState.ELIMINADO}>Eliminados</option>
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
