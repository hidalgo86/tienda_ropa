import Card from "../components/Card/Card";
import Pagination from "../components/Pagination";
import Filtros from "../components/Filtros";
import Navbar from "../components/Navbar";
import { notFound } from "next/navigation";
import { getProducts } from "@/services/products.services";
import { ProductServer } from "@/types/product.type";
import FiltrosMobileButton from "./FiltrosMobileButton";

export default async function ProductsClient({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || "";
  const minPrice = params?.precioMin ? Number(params.precioMin) : undefined;
  const maxPrice = params?.precioMax ? Number(params.precioMax) : undefined;
  let genre = params?.genero || "";
  if (genre) {
    const genreMap: Record<string, string> = {
      niño: "NINO",
      nino: "NINO",
      niña: "NINA",
      nina: "NINA",
      unisex: "UNISEX",
      NINO: "NINO",
      NINA: "NINA",
      UNISEX: "UNISEX",
    };
    const normalized = String(genre).trim().toLowerCase();
    genre = genreMap[normalized] || genre.toUpperCase();
  }
  const data = await getProducts(
    page,
    20,
    undefined,
    search,
    genre,
    minPrice,
    maxPrice
  );
  const { items, totalPages } = data;
  if (page < 1 || (totalPages && page > totalPages)) return notFound();
  const noProducts = !items || items.length === 0;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      {/* Botón de filtros solo móvil */}
      <FiltrosMobileButton />
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
          {noProducts ? (
            <div className="w-full text-center text-gray-500 py-8 sm:py-12 lg:py-16 px-4 sm:px-8">
              <div className="max-w-md mx-auto">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">📦</div>
                <p className="text-base sm:text-lg lg:text-xl font-medium mb-2">
                  No hay productos disponibles
                </p>
                <div className="space-y-2 text-xs sm:text-sm text-gray-400">
                  <p>
                    📊 Total productos: {data?.total || 0} • Página: {page}
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
