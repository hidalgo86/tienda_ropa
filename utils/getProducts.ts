// utils/getProducts.ts
import { Product } from "../app/types/products";

export interface PaginatedProducts {
  items: Partial<Product>[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(page: number): Promise<PaginatedProducts> {
  try {
    const res = await fetch(
      "https://chikitoslandia-copy-production.up.railway.app/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
        query {
          products(
            input: {
              pagination: { page: ${page} }
            }
          ) {
            items { id name description genre size price stock imageUrl imagePublicId status }
            total
            page
            totalPages
          }
        }
      `,
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Error al obtener productos");
    const { data } = await res.json();
    return data.products;
  } catch (error) {
    console.error("Error en getProducts:", error);
    return { items: [], total: 0, page: 1, totalPages: 10 };
  }
}
