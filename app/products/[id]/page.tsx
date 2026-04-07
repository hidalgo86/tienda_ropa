// src/app/products/[id]/page.tsx
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getProductById } from "@/services/products";
import ProductDetailClient from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!id) return notFound();

  try {
    const reqHeaders = await headers();
    const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host");
    const protocol = reqHeaders.get("x-forwarded-proto") ?? "https";
    const baseUrl = host
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

    const producto = await getProductById(id, {
      baseUrl,
      cache: "no-store",
    });

    return <ProductDetailClient producto={producto} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound();
  }
}
