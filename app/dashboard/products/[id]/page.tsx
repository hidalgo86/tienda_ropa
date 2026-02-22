import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Product } from "@/types/product.type";
import ProductDetailClient from "../../../products/[id]/ProductDetailClient";

interface DashboardProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardProductDetailPage({
  params,
}: DashboardProductDetailPageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

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

    const res = await fetch(`${baseUrl}/api/products/get/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return notFound();
    }

    const producto: Product | null = await res.json();

    if (!producto) {
      return notFound();
    }

    return <ProductDetailClient producto={producto} mode="admin" />;
  } catch (error) {
    console.error("Error fetching dashboard product detail:", error);
    return notFound();
  }
}
