"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "../types/products";

export default function ProductDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [producto, setProducto] = useState<Product | null>(null);

  useEffect(() => {
    const productoParam = searchParams ? searchParams.get("producto") : null;
    if (productoParam) {
      try {
        setProducto(JSON.parse(decodeURIComponent(productoParam)));
      } catch {
        setProducto(null);
      }
    }
  }, [searchParams]);

  if (!producto)
    return <div className="p-8 text-center">Producto no encontrado</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 left-2 text-gray-500 hover:text-blue-500 text-xl px-2 py-1 bg-gray-100 rounded"
          onClick={() => router.back()}
        >
          &#8592; Volver
        </button>
        <Image
          src={producto.imageUrl ?? "/placeholder.webp"}
          alt={producto.name ?? "Producto sin nombre"}
          width={600}
          height={400}
          className="w-full h-[400px] object-contain mb-6"
        />
        <h2 className="text-2xl font-bold mb-2">{producto.name}</h2>
        <p className="text-blue-600 font-bold text-lg mb-2">
          ${producto.price}
        </p>
        <p className="text-gray-600 mb-2">{producto.description}</p>
        <p className="text-gray-500 text-sm mb-2">
          {producto.size && producto.size.length > 0
            ? `Tallas: ${producto.size.join(", ")}`
            : "Sin tallas"}
        </p>
        <p className="text-gray-500 text-sm mb-2">Stock: {producto.stock}</p>
      </div>
    </div>
  );
}
