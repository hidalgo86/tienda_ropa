"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Product, ProductServer } from "@/types/product.type";
import ProductListPublic from "@/components/products/ProductListPublic";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/favoriteSlice";
import Link from "next/link";

export default function Cards() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Consultar productos usando el endpoint API interno
      const res = await fetch(
        "/api/products/get?page=1&limit=20&status=DISPONIBLE",
      );
      if (!res.ok) throw new Error("Error al consultar productos");
      const response = await res.json();
      setProductos(response.items);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
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
            onClick={() => loadProducts()}
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

  const handleAddToCart = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;
    const variants = producto.variants || [];
    const size =
      variants.find((v) => (v.stock || 0) > 0)?.size || variants[0]?.size;
    if (!size) return; // sin talla, no agregar
    dispatch(
      addToCart({
        product: producto as ProductServer,
        quantity: 1,
        selectedSize: size,
      }),
    );
  };

  const handleFavorite = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;
    dispatch(toggleFavorite(producto as ProductServer));
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
          Nuestros Productos
        </h2>
        <p className="text-sm sm:text-base text-gray-600 lg:text-lg">
          Descubre nuestra colección de ropa para bebés
        </p>
      </div>

      <ProductListPublic
        products={productos.slice(0, 4)}
        onAddToCart={handleAddToCart}
        onFavorite={handleFavorite}
      />

      <div className="flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm sm:text-base shadow"
          aria-label="Ver todos los productos"
        >
          Ver todos
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
