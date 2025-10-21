import ProductsClient from "./ProductsClient";

import { Metadata } from "next";

interface ProductsPageProps {
  searchParams?: Record<string, string>;
}

export default function ProductsPage(props: ProductsPageProps) {
  return <ProductsClient {...props} />;
}
