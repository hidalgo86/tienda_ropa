import ProductsClient from "./ProductsClient";

interface ProductsPageProps {
  searchParams?: Promise<Record<string, string>>;
}

export default function ProductsPage(props: ProductsPageProps) {
  return <> HOLA
  {/* <ProductsClient {...props} />; */}
  </>
}
