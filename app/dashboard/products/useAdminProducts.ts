"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Product, ProductStatus } from "@/types/product.type";

interface UseAdminProductsParams {
  status: ProductStatus;
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
  status,
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

      const params = new URLSearchParams();
      params.append("status", String(status));
      params.append("page", String(page));
      params.append("limit", String(limit));
      // API espera el texto de búsqueda en el parámetro "name"
      if (search.trim()) {
        params.append("name", search.trim());
      }

      try {
        const res = await fetch(`/api/products/get?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (data && (data.message || data.error)) ||
              "Error al cargar productos",
          );
        }

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
    [status, page, limit, search],
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
