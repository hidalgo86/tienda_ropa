"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, ProductStatus } from "@/types/product.type";
import ProductListAdmin from "@/components/products/ProductListAdmin";
import Pagination from "@/components/Pagination";

const Products: React.FC = () => {
  const searchParams = useSearchParams();
  const initialLimit = Number(searchParams.get("limit")) || 50;
  const [limit] = useState(initialLimit);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Product["status"]>(
    ProductStatus.DISPONIBLE,
  );
  const abortRef = useRef<AbortController | null>(null);

  // Debounce de la búsqueda para evitar múltiples requests por tecla
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    // Abortar cualquier request previo antes de iniciar uno nuevo
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append("status", String(status));
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (debouncedSearch.trim()) {
      params.append("name", debouncedSearch.trim());
    }

    try {
      const res = await fetch(`/api/products/get?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && (data.message || data.error)) || "Error al cargar productos",
        );
      }

      setProducts((data && data.items) || []);
      setTotalPages((data && data.totalPages) || 1);
      setLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Request abortado por cambio rápido de filtros/paginación
        return;
      }
      setError(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
      setLoading(false);
    }
  }, [status, page, debouncedSearch, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Abortar en desmontaje del componente
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const router = useRouter();
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  // Función para eliminar producto
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;
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
      // Tras eliminar, refrescar la lista para mantener paginación consistente
      await fetchProducts();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "No se pudo eliminar el producto",
      );
    }
  };

  // Función para restaurar producto
  const handleRestore = async (id: string) => {
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
      // Tras restaurar, refrescar la lista
      await fetchProducts();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "No se pudo restaurar el producto",
      );
    }
  };

  // Función para editar producto (redirecciona a la página de edición)
  const handleEdit = (id: string) => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleStatusChange = (value: Product["status"]) => {
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
          onChange={(e) =>
            handleStatusChange(e.target.value as Product["status"])
          }
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

export default Products;
// Componente para mostrar la lista de productos
// Utiliza CardsWrapper para cargar los productos de forma dinámica
// y evitar problemas con window en SSR
// Importante: Este componente debe ser un componente de cliente
// para poder usar hooks y manejar el estado
// de carga y error correctamente
// También debe ser responsivo y adaptarse a diferentes tamaños de pantalla
// Usar Tailwind CSS para estilos modernos y accesibles
// Incluir comentarios en el código para mayor claridad
// Asegurarse de que el componente sea compatible con TypeScript
// y que funcione correctamente con diferentes tipos de datos de productos
// Exportar el componente para su uso en otras partes del dashboard
// El tipado esta en types/product.type.ts
// Incluir manejo de estados de carga o error si es necesario
// Asegurarse de que el componente sea probado y funcione correctamente
// con diferentes tipos de datos de productos
// y en diferentes tamaños de pantalla
// el componente card crea cada tarjeta individual de producto
// este componente solo envuelve la carga dinamica de las tarjetas
// y no necesita props adicionales
// Incluir un indicador de carga mientras se cargan las tarjetas
// Usar un spinner o mensaje de carga adecuado
// para mejorar la experiencia del usuario
// los productos se cargan desde un endpoint en app/api/products/get
// que devuelve un JSON con los productos paginados
// Asegurarse de que el componente maneje correctamente la paginación
// si es necesario en el futuro
// y que pueda escalar para manejar grandes cantidades de productos
//
