import PublicListWrapper from "./PublicListWrapper";
import Pagination from "./Pagination";
import Filtros from "../../../../components/Filtros";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  ProductAvailability,
  Product,
  Size,
  allowedSizes,
  parseGenre,
} from "@/types/domain/products";
import FiltrosMobileButton from "./FiltrosMobileButton";
import { listProducts } from "@/services/products";

const readSingleParam = (
  params: Record<string, string> | undefined,
  ...keys: string[]
) => {
  for (const key of keys) {
    const value = params?.[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

const parseOptionalNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default async function ProductsClient({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = readSingleParam(params, "search");
  const minPrice = parseOptionalNumber(
    readSingleParam(params, "minPrice", "precioMin"),
  );
  const maxPrice = parseOptionalNumber(
    readSingleParam(params, "maxPrice", "precioMax"),
  );
  const parsedGenre = parseGenre(readSingleParam(params, "genre", "genero"));
  const categoryId = readSingleParam(params, "categoryId");
  const category = readSingleParam(params, "category");
  const sizeParam = readSingleParam(params, "size", "talla");
  const sizes = sizeParam
    ? [String(sizeParam).trim().toUpperCase() as Size].filter(
        (size): size is Size => allowedSizes.has(size),
      )
    : undefined;

  const reqHeaders = await headers();
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
  const protocol = reqHeaders.get("x-forwarded-proto") ?? "https";

  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

  let data;
  try {
    data = await listProducts(
      {
        page,
        limit: 20,
        availability: ProductAvailability.DISPONIBLE,
        name: search || undefined,
        categoryId: categoryId || undefined,
        category: category || undefined,
        genre: parsedGenre ?? undefined,
        sizes,
        minPrice,
        maxPrice,
      },
      { baseUrl, cache: "no-store" },
    );
  } catch {
    return notFound();
  }

  const { items, totalPages } = data;
  const safeTotalPages = Math.max(1, totalPages || 1);
  const noProducts = !items || items.length === 0;

  if (page < 1 || (!noProducts && page > safeTotalPages)) return notFound();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Botón de filtros solo móvil */}
      <FiltrosMobileButton />
      <div className="flex flex-1 w-full min-w-0">
        {/* Sidebar de filtros - Solo desktop */}
        <aside
          className="hidden w-full max-w-xs min-w-[240px] border-r border-gray-200 bg-gray-50 p-4 lg:block xl:p-6"
          aria-label="Filtros de productos"
        >
          <Filtros />
        </aside>
        {/* Contenido principal responsivo */}
        <main className="min-w-0 flex-1 px-3 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-24 lg:px-8 lg:py-8 lg:pb-8">
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
            <PublicListWrapper products={items as Product[]} />
          )}
        </main>
      </div>
      {/* Footer con paginación responsiva */}
      <footer className="sticky bottom-0 left-0 z-20 w-full border-t border-gray-200 bg-white/95 pt-2 pb-20 backdrop-blur-sm sm:pt-3 sm:pb-24 lg:pt-4 lg:pb-5">
        <div className="flex justify-center px-3 sm:px-6 lg:px-8">
          <Pagination currentPage={page} totalPages={safeTotalPages} />
        </div>
      </footer>
    </div>
  );
}
