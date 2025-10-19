import { notFound } from "next/navigation";
import { getProductoById } from "@/services/products.services";
import { ProductServer } from "@/types/product.type";
import ProductDetailClient from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  try {
    const producto: ProductServer | null = await getProductoById(id);

    if (!producto) {
      return notFound();
    }

    return <ProductDetailClient producto={producto} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound();
  }
}
