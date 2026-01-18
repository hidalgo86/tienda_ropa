import { notFound } from "next/navigation";
import { Product } from "@/types/product.type";
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
    // Consultar el producto usando el endpoint API interno
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/products/get/${id}`
    );
    if (!res.ok) {
      return notFound();
    }
    const producto: Product | null = await res.json();

    if (!producto) {
      return notFound();
    }

    return <ProductDetailClient producto={producto} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound();
  }
}
