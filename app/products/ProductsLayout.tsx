"use client";
import Navbar from "../components/Navbar";
import FiltrosModal from "../components/FiltrosModal";
import Filtros from "../components/Filtros";
import Pagination from "../components/Pagination";
import Card from "../components/Card/Card";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProductServer } from "@/types/product.type";

export default function ProductsLayout({
  items,
  totalPages,
  page,
  noProducts,
  total,
}: {
  items: ProductServer[];
  totalPages: number;
  page: number;
  noProducts: boolean;
  total: number;
}) {
  const [showFiltrosModal, setShowFiltrosModal] = useState(false);

  useEffect(() => {
    const handler = () => setShowFiltrosModal(true);
    window.addEventListener("openFiltrosModal", handler);
    return () => window.removeEventListener("openFiltrosModal", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {/* Modal de filtros móvil */}
      <FiltrosModal
        isOpen={showFiltrosModal}
        onClose={() => setShowFiltrosModal(false)}
      />
      <div className="flex flex-1 w-full">
        {/* Sidebar de filtros - Solo desktop */}
        <aside
          className="w-full max-w-xs min-w-[220px] p-3 sm:p-4 lg:p-6 bg-gray-50 border-r border-gray-200 hidden lg:block"
          aria-label="Filtros de productos"
        >
          <Filtros />
        </aside>
        {/* Contenido principal responsivo */}
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-20 sm:pb-24 lg:pb-8">
          {/* ...existing code for title, filters, etc... */}
          {noProducts ? (
            <div className="w-full text-center text-gray-500 py-8 sm:py-12 lg:py-16 px-4 sm:px-8">
              <div className="max-w-md mx-auto">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">📦</div>
                <p className="text-base sm:text-lg lg:text-xl font-medium mb-2">
                  No hay productos disponibles
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-400">
                  <p>
                    📊 Total productos: {total || 0} • Página: {page}
                  </p>
                  <p className="text-blue-600">
                    💡 Los productos necesitan variants con stock para aparecer
                    aquí
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 justify-items-center">
              {items.map((product: ProductServer, index: number) => (
                <Card
                  key={product.id}
                  producto={product}
                  priority={index === 0}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      {/* Footer con paginación responsiva */}
      <footer className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 pt-2 pb-3 sm:pt-3 sm:pb-4 lg:pt-4 lg:pb-5 z-20">
        <div className="flex justify-center px-3 sm:px-6 lg:px-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/products"
          />
        </div>
      </footer>
    </div>
  );
}
