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
      <div className="text-center py-6 sm:py-10 lg:py-12">
        <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Cargando productos...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-10 lg:py-12">
        <div className="max-w-md mx-auto px-4">
          <p className="text-red-600 text-sm sm:text-base mb-4">{error}</p>
          <button
            onClick={() => loadProducts(true)}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-6 sm:py-10 lg:py-12">
        <p className="text-gray-500 text-sm sm:text-base">
          No hay productos para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Título responsivo */}
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
          Nuestros Productos
        </h2>
        <p className="text-sm sm:text-base text-gray-600 lg:text-lg">
          Descubre nuestra colección de ropa para bebés
        </p>
      </div>

      {/* Grid de productos completamente responsivo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 justify-items-center">
        {productos.map((producto) => (
          <Card key={producto.id ?? Math.random()} producto={producto} />
        ))}
      </div>
    </div>
  );
}
