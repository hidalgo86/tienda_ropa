import {
  Genre,
  PaginatedProducts,
  ProductsQueryModel,
  ProductStatus,
  Size,
} from "@/types/product.type";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Extraer parámetros de la query
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const status = searchParams.get("status") || undefined;
    const genre = searchParams.get("genre") || undefined;
    const size = searchParams.getAll("size");
    const name = searchParams.get("name") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;

    // Construir el input para el query GraphQL
    const input: ProductsQueryModel = {
      pagination: { page, limit },
      filters: {},
    };

    if (status) input.filters.status = status.toUpperCase() as ProductStatus;
    if (genre) input.filters.genre = genre as Genre;
    if (minPrice) input.filters.minPrice = minPrice;
    if (maxPrice) input.filters.maxPrice = maxPrice;
    if (size.length > 0) input.filters.size = size as Size[];
    if (name) input.filters.name = name;

    // Construir el query GraphQL
    const query = `
      query Products($input: ProductsQueryInput) {
        products(input: $input) {
          items {
            id
            name
            genre
            status
            imageUrl
            variants { size price stock }
          }
          total
          page
          totalPages
        }
      }
    `;

    // Hacer la petición al endpoint GraphQL
    const backendRes = await fetch(process.env.API_URL + "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { input } }),
    });
    const response = await backendRes.json();
    const data = response.data.products as PaginatedProducts;
    const errors = response.errors;

    if (errors) {
      throw new Error(errors[0]?.message || "Error en GraphQL");
    }
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(
            (error as { message?: unknown }).message ??
              "Error al obtener productos"
          )
        : "Error al obtener productos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
