import ProductsClient from "./ProductsClient";

interface ProductsPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function ProductsPage(props: ProductsPageProps) {
  return <ProductsClient {...props} />;
}
