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
                input: { pagination: { page: ${page} } }
              ) {
                items {
                  id
                  name
                  description
                  genre
                  size
                  price
                  stock
                  imageUrl
                  imagePublicId
                  status
                }
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

    const result = await res.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors.map((e: any) => e.message).join(", "));
    }

    if (!result.data) {
      console.warn("No data returned from GraphQL");
      return { items: [], total: 0, page: 1, totalPages: 1 };
    }

    //mapear items para asegurar que genre pase de ingles a español (NINO, NINA, UNISEX)
    const genreMap: { [key: string]: string } = {
      NINO: "niño",
      NINA: "niña",
      UNISEX: "unisex",
    };

    // Transforma los items para mostrar el género legible
    const items = result.data.products.items.map((item: any) => ({
      ...item,
      genre: genreMap[item.genre] || item.genre,
    }));

    // Devuelve el objeto completo con items transformados
    return {
      ...result.data.products,
      items, // <-- items ya con los géneros traducidos
    };
  } catch (error) {
    console.error("Error en getProducts:", error);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

// // utils/getProducts.ts
// import { Product } from "../app/types/products";

// export interface PaginatedProducts {
//   items: Partial<Product>[];
//   total: number;
//   page: number;
//   totalPages: number;
// }

// export async function getProducts(page: number): Promise<PaginatedProducts> {
//   try {
//     const res = await fetch(
//       "https://chikitoslandia-copy-production.up.railway.app/graphql",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: `
//         query {
//           products(
//             input: {
//               pagination: { page: ${page} }
//             }
//           ) {
//             items { id name description genre size price stock imageUrl imagePublicId status }
//             total
//             page
//             totalPages
//           }
//         }
//       `,
//         }),
//         cache: "no-store",
//       }
//     );

//     if (!res.ok) throw new Error("Error al obtener productos");
//     const { data } = await res.json();
//     return data.products;
//   } catch (error) {
//     console.error("Error en getProducts:", error);
//     return { items: [], total: 0, page: 1, totalPages: 1 };
//   }
// }
