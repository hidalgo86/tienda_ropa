import { Producto } from "@/app/dashboard/components/Products/Form";

export async function getProductoById(id: string): Promise<Producto | null> {
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
  const res = await fetch(process.env.API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id } }),
    next: { revalidate: 0 },
  });
  const { data } = await res.json();
  return data?.product ?? null;
}
