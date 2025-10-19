"use client";

import { useEffect, useState } from "react";
import Card from "../Card/Card";
import { ProductServer } from "@/types/product.type";
import { getProducts } from "@/services/products.services";

export default function Cards() {
  const [productos, setProductos] = useState<ProductServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getProducts(1);
      setProductos(response.items);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Configurar un intervalo para actualizar los productos cada 30 segundos
    const interval = setInterval(() => loadProducts(), 30000);

    // Listener para actualizar cuando la página recibe foco
    const handleFocus = () => {
      loadProducts();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => loadProducts(true)}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No hay productos para mostrar.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de actualización manual */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Nuestros Productos</h2>
        <button
          onClick={() => loadProducts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
        {productos.map((producto) => (
          <Card key={producto.id ?? Math.random()} producto={producto} />
        ))}
      </div>
    </div>
  );
}
