"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdFavorite } from "react-icons/md";
import { useState } from "react";
import { ProductServer } from "@/types/product.type";

interface CardProps {
  producto: ProductServer;
  priority?: boolean;
}

export default function Card({ producto, priority = false }: CardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    producto.imageUrl ?? "/placeholder.webp"
  );

  const variants = producto.variants;
  const minPrice = Array.isArray(variants)
    ? variants
        .map((v) => Number(v?.price))
        .filter((n) => Number.isFinite(n))
        .reduce(
          (min, n) => (min === null ? n : Math.min(min, n)),
          null as number | null
        )
    : null;
  const sizesCsv = Array.isArray(variants)
    ? variants
        .map((v) => v?.size)
        .filter(Boolean)
        .join(", ")
    : "";

  const handleClick = () => {
    if (producto.id) {
      const productoParam = encodeURIComponent(JSON.stringify(producto));
      router.push(`/detalle?producto=${productoParam}`);
    }
  };

  return (
    <div
      className="w-[210px] h-[310px] bg-pink-50 rounded-xl shadow-lg overflow-hidden border border-pink-100 relative cursor-pointer flex flex-col hover:scale-105 hover:shadow-xl transition-transform duration-300"
      onClick={handleClick}
      style={{ minWidth: 210, maxWidth: 210 }}
    >
      {/* Imagen */}
      <div className="w-full h-[210px] flex items-center justify-center bg-pink-100 relative">
        <Image
          src={imgSrc}
          alt={
            producto.name ? `Imagen de ${producto.name}` : "Producto sin nombre"
          }
          width={210}
          height={210}
          className="object-cover w-full h-full rounded-t-xl"
          placeholder="empty"
          {...(priority ? { priority: true } : { loading: "lazy" })}
          onError={() => setImgSrc("/placeholder.webp")}
          sizes="(max-width: 768px) 100vw, 210px"
        />

        {/* Botón de favorito en la esquina superior derecha */}
        <button
          aria-label="Añadir a favoritos"
          className="absolute top-2 right-2 p-2 bg-pink-200 rounded-full hover:bg-pink-300 transition-colors flex items-center justify-center z-10"
          title="Favorito"
          onClick={(e) => e.stopPropagation()}
        >
          <MdFavorite size={22} color="#E4405F" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 max-h-[100px] overflow-hidden">
        {/* Nombre */}
        <h3 className="font-medium text-gray-700 text-sm mb-1 line-clamp-1">
          {producto.name ?? "Producto sin nombre"}
        </h3>

        {/* Precio y tallas */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-pink-500 font-bold text-lg">
            {Number.isFinite(minPrice)
              ? `$${(minPrice as number).toFixed(2)}`
              : ""}
          </span>
          <span className="text-gray-500 text-xs" translate="no">
            {sizesCsv ? `Tallas: ${sizesCsv}` : "Sin talla"}
          </span>
        </div>

        {/* Descripción corta */}
        {producto.description && (
          <p className="text-gray-600 text-xs line-clamp-2">
            {producto.description}
          </p>
        )}
      </div>
    </div>
  );
}
