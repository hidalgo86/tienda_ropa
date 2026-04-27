import type { Metadata } from "next";
import Carrusel from "../../../components/Carrusel/Carrusel";
import ClientCards from "../../../components/ClientCards";
import { listProducts } from "@/services/products";
import { ProductAvailability } from "@/types/domain/products";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ropa, juguetes y articulos para bebes y ninos",
  description:
    "Compra ropa, juguetes y articulos para bebes y ninos en Chikitoslandia.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function Home() {
  const featuredProducts = await listProducts({
    page: 1,
    limit: 4,
    availability: ProductAvailability.DISPONIBLE,
  }, { baseUrl: siteUrl, cache: "no-store" })
    .then((response) => response.items ?? [])
    .catch(() => []);

  return (
    <div className="bg-white min-h-screen">
      <main className="mx-auto max-w-7xl px-3 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 lg:pb-6 lg:pt-8">
        <div className="mt-2 sm:mt-4 lg:mt-0">
          <Carrusel />
        </div>

        <section className="mt-8 mb-8 sm:mt-12 sm:mb-12 lg:mt-16 lg:mb-16">
          <ClientCards initialProducts={featuredProducts} />
        </section>
      </main>
    </div>
  );
}
