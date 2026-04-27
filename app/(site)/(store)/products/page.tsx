import type { Metadata } from "next";
import type { ProductsPageProps } from "@/types/ui/products";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora ropa, juguetes y articulos para bebes y ninos en Chikitoslandia.",
  alternates: {
    canonical: "/products",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Productos | Chikitoslandia",
    description:
      "Explora ropa, juguetes y articulos para bebes y ninos en Chikitoslandia.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsPage(props: ProductsPageProps) {
  return <ProductsClient {...props} />;
}
