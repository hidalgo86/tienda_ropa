import { useEffect, useState } from "react";

export interface Producto {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  imageUrl?: string;
  imagePublicId?: string;
  description?: string;
}

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://chikitoslandia.up.railway.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{
            products {
              id
              name
              category
              price
              stock
              imageUrl
              imagePublicId
              description
            }
          }`,
        }),
      });
      const { data, errors } = await res.json();
      if (errors) throw new Error(errors[0]?.message || "Error en GraphQL");

      setProductos(data.products);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al cargar productos";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Llama a fetchProductos al montar
  useEffect(() => {
    fetchProductos();
  }, []);

  return { productos, loading, error, refetch: fetchProductos };
}
