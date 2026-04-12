"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminProductFilter,
  Product,
  ProductAvailability,
  ProductState,
} from "@/types/product.type";
import { listProducts } from "@/services/products";

interface UseAdminProductsParams {
  filter: AdminProductFilter;
  page: number;
  limit: number;
  search: string;
}

interface FetchProductsOptions {
  // Cuando es true, refresca datos sin activar spinner global de página
  silent?: boolean;
}

// Hook de datos para dashboard admin:
// - Ejecuta fetch con filtros/paginación
// - Maneja loading/error/totalPages
// - Aborta requests anteriores para evitar race conditions
export const useAdminProducts = ({
  filter,
  page,
  limit,
  search,
}: UseAdminProductsParams) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(
    async ({ silent = false }: FetchProductsOptions = {}) => {
      // Cancelamos request anterior antes de iniciar uno nuevo
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const state =
          filter === ProductState.ELIMINADO
            ? ProductState.ELIMINADO
            : undefined;
        const availability =
          filter === ProductAvailability.DISPONIBLE ||
          filter === ProductAvailability.AGOTADO
            ? filter
            : undefined;

        const data = await listProducts(
          {
            state,
            availability,
            page,
            limit,
            name: search.trim() || undefined,
          },
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        setProducts((data && data.items) || []);
        setTotalPages((data && data.totalPages) || 1);
        setLoading(false);
      } catch (err) {
        // Si se abortó por cambio de filtros/página, no tratamos como error de negocio
        if (err instanceof DOMException && err.name === "AbortError") {
          if (!silent) {
            setLoading(false);
          }
          return;
        }
        setError(
          err instanceof Error ? err.message : "Error al cargar productos",
        );
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [filter, page, limit, search],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    products,
    setProducts,
    totalPages,
    loading,
    error,
    refetch: fetchProducts,
  };
};
