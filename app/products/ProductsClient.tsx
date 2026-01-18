import PublicListWrapper from "./PublicListWrapper";
import Pagination from "./Pagination";
import Filtros from "../components/Filtros";
import Navbar from "../../components/Navbar";
import { notFound } from "next/navigation";
import { Product } from "@/types/product.type";
import FiltrosMobileButton from "./FiltrosMobileButton";

export default async function ProductsClient({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = searchParams ?? {};
  const getStr = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] ?? "" : v ?? "";
  const page = Number(getStr(params.page)) || 1;
  const search = getStr(params.search) || "";
  const minPrice = params?.precioMin
    ? Number(getStr(params.precioMin))
    : undefined;
  const maxPrice = params?.precioMax
    ? Number(getStr(params.precioMax))
    : undefined;
  let genre = getStr(params.genero) || "";
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

  const paramsApi = new URLSearchParams();
  paramsApi.append("page", String(page));
  paramsApi.append("limit", "20");
  if (search) paramsApi.append("name", search);
  if (genre) paramsApi.append("genre", genre);
  if (minPrice !== undefined) paramsApi.append("minPrice", String(minPrice));
  if (maxPrice !== undefined) paramsApi.append("maxPrice", String(maxPrice));

  try {
    const res = await fetch(`/api/products/get?${paramsApi.toString()}`);
    if (!res.ok) {
      const message = `Error al cargar productos (${res.status})`;
      return (
        <div className="min-h-screen flex flex-col bg-white">
          <Navbar />
          <main className="flex-1 px-6 py-10">
            <div className="max-w-lg mx-auto text-center">
              <h1 className="text-2xl font-bold mb-2">
                No se pudieron cargar los productos
              </h1>
              <p className="text-gray-600">{message}</p>
            </div>
          </main>
        </div>
      );
    }
    const data = await res.json();
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
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">
                    📦
                  </div>
                  <p className="text-base sm:text-lg lg:text-xl font-medium mb-2">
                    No hay productos disponibles
                  </p>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-400">
                    <p>
                      📊 Total productos: {data?.total || 0} • Página: {page}
                    </p>
                    <p className="text-blue-600">
                      💡 Los productos necesitan variants con stock para
                      aparecer aquí
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <PublicListWrapper products={items as Product[]} />
            )}
          </main>
        </div>
        {/* Footer con paginación responsiva */}
        <footer className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 pt-2 pb-3 sm:pt-3 sm:pb-4 lg:pt-4 lg:pb-5 z-20">
          <div className="flex justify-center px-3 sm:px-6 lg:px-8">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </footer>
      </div>
    );
  } catch (e) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 px-6 py-10">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-2xl font-bold mb-2">Error de servidor</h1>
            <p className="text-gray-600">
              Ocurrió un problema al cargar los productos. Intenta más tarde.
            </p>
          </div>
        </main>
      </div>
    );
  }
}
