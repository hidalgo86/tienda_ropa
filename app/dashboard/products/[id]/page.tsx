import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Product } from "@/types/domain/products";
import type { DashboardProductDetailPageProps } from "@/types/ui/products";
import ProductDetailClient from "../../../(site)/(store)/products/[id]/ProductDetailClient";
import { getProductById } from "@/services/products";

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

    const producto: Product = await getProductById(id, {
      baseUrl,
      cache: "no-store",
      trackView: false,
    });

    if (!producto) {
      return notFound();
    }

    return <ProductDetailClient producto={producto} mode="admin" />;
  } catch (error) {
    console.error("Error fetching dashboard product detail:", error);
    return notFound();
  }
}
