import api from "./api"; // axios.create({ baseURL: ... })
import { PaginatedProducts, ProductServer } from "@/types/product.type";

export async function getProducts(page: number): Promise<PaginatedProducts> {
  const { data } = await api.post("/graphql", {
    query: `
      query ($page: Int!) {
        products(input: { pagination: { page: $page } }) {
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
    variables: { page },
  });

  if (data.errors)
    throw new Error(data.errors.map((e: any) => e.message).join(", "));

  const genreMap: { [key: string]: string } = {
    NINO: "niño",
    NINA: "niña",
    UNISEX: "unisex",
  };

  const items = data.data.products.items.map((item: any) => ({
    ...item,
    genre: genreMap[item.genre] || item.genre,
  }));

  return { ...data.data.products, items };
}

export async function getProductoById(id: string): Promise<ProductServer> {
  const query = `
    query product($id: String!) {
      product(id: $id) {
        id
        name
        description
        genre
        size
        price
        stock
        imageUrl
        imagePublicId
      }
    }
  `;

  try {
    const { data } = await api.post("/graphql", {
      query,
      variables: { id },
    });

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
    }

    return data.data?.product ?? null;
  } catch (error) {
    console.error("Error en getProductoById:", error);
    throw error
  }
}
