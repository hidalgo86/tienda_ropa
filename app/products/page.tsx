import Card from "../components/Card/Card";
import Pagination from "../components/Pagination";
import Filtros from "../components/Filtros";
import Navbar from "../components/Navbar";
import { getProducts } from "../../utils/getProducts";
import { notFound } from "next/navigation";

interface ProductsSearchParams {
  page?: string | number;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<ProductsSearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const { items, totalPages } = await getProducts(page);
  // Extraer categorías únicas de los productos
  const categorias = Array.from(
    new Set(
      items
        .map((p) => p.genre)
        .filter((g): g is Exclude<typeof g, undefined> => !!g)
    )
  ).map(String);

  if (page < 1 || (totalPages && page > totalPages)) return notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full">
        <aside className="w-full max-w-xs min-w-[220px] p-4 bg-gray-50 border-r border-gray-200 hidden md:block">
          <Filtros />
        </aside>
        <main className="flex-1 p-4">
          <div className="flex flex-wrap gap-4">
            {items.map((product, index) => (
              <Card
                key={product.id}
                producto={product}
                priority={index === 0}
              />
            ))}
          </div>
        </main>
      </div>
      <footer className="sticky bottom-0 left-0 w-full bg-white z-10 border-t pt-1 pb-2 flex justify-center">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/products"
        />
      </footer>
    </div>
  );
}
