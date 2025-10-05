import Card from "../components/Card/Card";
import Pagination from "../components/Pagination";
import Filtros from "../components/Filtros";
import Navbar from "../components/Navbar";
import { notFound } from "next/navigation";
import { getProducts } from "@/services/products.services";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const { items, totalPages } = await getProducts(page);

  if (page < 1 || (totalPages && page > totalPages)) return notFound();

  const noProducts = !items || items.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full">
        <aside
          className="w-full max-w-xs min-w-[220px] p-4 bg-gray-50 border-r border-gray-200 hidden md:block"
          aria-label="Filtros de productos"
        >
          <Filtros />
        </aside>
        <main className="flex-1 p-4">
          {noProducts ? (
            <div className="w-full text-center text-gray-500 py-10 text-lg">
              No hay productos en esta página.
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {items.map((product, index) => (
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
