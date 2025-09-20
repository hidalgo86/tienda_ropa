"use client";
import useProducts from "./useProducts";

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error al cargar productos</div>;

  return (
    <div>
      <h1>Productos</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {products?.map((product) => (
          <div
            key={product.id}
            style={{ border: "1px solid #ccc", padding: 16, width: 220 }}
          >
            <img
              src={product.imageUrl || "/placeholder.webp"}
              alt={product.name}
              style={{ width: "100%", height: 120, objectFit: "cover" }}
            />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Precio: ${product.price}</p>
            <p>Stock: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
