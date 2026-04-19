import type { ProductsPageProps } from "@/types/ui/products";
import ProductsClient from "./ProductsClient";

export default function ProductsPage(props: ProductsPageProps) {
  return <ProductsClient {...props} />;
}
