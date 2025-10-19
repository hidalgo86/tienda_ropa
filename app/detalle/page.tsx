"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductServer } from "@/types/product.type";
import { MdArrowBack } from "react-icons/md";

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [producto, setProducto] = useState<ProductServer | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    const productoParam = searchParams ? searchParams.get("producto") : null;
    if (productoParam) {
      try {
        const parsed: ProductServer = JSON.parse(
          decodeURIComponent(productoParam)
        );
        setProducto(parsed);
        const firstSize = parsed.variants?.[0]?.size || "";
        setSelectedSize(firstSize);
      } catch {
        setProducto(null);
      }
    }
  }, [searchParams]);

  if (!producto)
    return <div className="p-8 text-center">Producto no encontrado</div>;

  const variants = producto.variants;
  const totalStock = Array.isArray(variants)
    ? variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0)
    : 0;
  const currentVariant = Array.isArray(variants)
    ? variants.find((v) => v.size === selectedSize)
    : undefined;
  const displayPrice =
    currentVariant?.price ??
    (Array.isArray(variants)
      ? Math.min(
          ...variants
            .map((v) => Number(v?.price))
            .filter((n) => Number.isFinite(n))
        )
      : 0);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center py-10 px-4">
      {/* Botón volver arriba */}
      <div className="w-full max-w-4xl mb-4">
        <button
          className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition"
          onClick={() => router.back()}
        >
          <MdArrowBack size={20} />
          <span className="text-sm">Volver</span>
        </button>
      </div>

      {/* Card producto */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div className="flex items-center justify-center">
          <Image
            src={producto.imageUrl ?? "/placeholder.webp"}
            alt={producto.name ?? "Producto sin nombre"}
            width={600}
            height={400}
            className="rounded-lg object-contain max-h-[400px] w-auto"
          />
        </div>

        {/* Detalles */}
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {producto.name}
          </h2>
          <p className="text-pink-600 font-bold text-2xl mb-4">
            ${Number(displayPrice || 0).toFixed(2)}
          </p>
          <p className="text-gray-600 mb-4">{producto.description}</p>

          {/* Tallas */}
          {Array.isArray(variants) && variants.length > 0 ? (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Tallas disponibles:
              </h4>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    className={`px-3 py-1 border rounded-lg text-sm transition ${
                      selectedSize === v.size
                        ? "border-pink-500 text-pink-600 bg-pink-50"
                        : "border-gray-300 hover:border-pink-400 hover:text-pink-500"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">Sin tallas</p>
          )}

          {/* Stock */}
          <p className="text-gray-500 text-sm mb-4">
            Stock disponible: {totalStock}
          </p>

          {/* Botones de acción */}
          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition">
              Agregar al carrito
            </button>
            <button className="flex-1 border border-pink-500 text-pink-500 py-2 rounded-lg hover:bg-pink-50 transition">
              Comprar ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
