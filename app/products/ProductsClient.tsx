import PublicListWrapper from "./PublicListWrapper";
import Pagination from "./Pagination";
import Filtros from "../components/Filtros";
import Navbar from "../../components/Navbar";
import { notFound } from "next/navigation";
import { Product } from "@/types/product.type";
import FiltrosMobileButton from "./FiltrosMobileButton";

export default async function ProductsClient({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const search = params?.search || "";
  const minPrice = params?.precioMin ? Number(params.precioMin) : undefined;
  const maxPrice = params?.precioMax ? Number(params.precioMax) : undefined;
  const genre = params?.genero || "";
  
  // Normalizar el género
  // if (genre) {
  //   const genreMap: Record<string, string> = {
  //     niño: "NINO",
  //     nino: "NINO",
  //     niña: "NINA",
  //     nina: "NINA",
  //     unisex: "UNISEX",
  //     NINO: "NINO",
  //     NINA: "NINA",
  //     UNISEX: "UNISEX",
  //   };
  //   const normalized = String(genre).trim().toLowerCase();
  //   genre = genreMap[normalized] || genre.toUpperCase();
  // }

  // Construir query params para la API interna
  const paramsApi = new URLSearchParams();
  paramsApi.append("page", String(page));
  paramsApi.append("limit", "20");
  if (search) paramsApi.append("search", search);
  if (genre) paramsApi.append("genre", genre);
  if (minPrice !== undefined) paramsApi.append("minPrice", String(minPrice));
  if (maxPrice !== undefined) paramsApi.append("maxPrice", String(maxPrice));

  // Usar URL absoluta para fetch en server component
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/products/get?${paramsApi.toString()}`
  );

  console.log("Fetching products with params:", baseUrl);
  

  if (!res.ok) return notFound();

  const data = await res.json();
  console.log("Products data:", data);

  const { items, totalPages } = data;

  if (page < 1 || (totalPages && page > totalPages)) return notFound();
  const noProducts = !items || items.length === 0;

  return (<>hola</>
 
  );
}
