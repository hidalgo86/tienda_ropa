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
      className="w-full max-w-[160px] sm:max-w-[180px] lg:max-w-[220px] 
                 h-[240px] sm:h-[280px] lg:h-[320px] 
                 bg-pink-50 rounded-lg sm:rounded-xl 
                 shadow-md sm:shadow-lg hover:shadow-xl
                 overflow-hidden border border-pink-100 
                 relative cursor-pointer flex flex-col 
                 hover:scale-105 transition-all duration-300"
      onClick={handleClick}
    >
      {/* Imagen responsiva */}
      <div className="w-full h-[160px] sm:h-[180px] lg:h-[220px] flex items-center justify-center bg-pink-100 relative">
        <Image
          src={imgSrc}
          alt={
            producto.name ? `Imagen de ${producto.name}` : "Producto sin nombre"
          }
          fill
          className="object-cover rounded-t-lg sm:rounded-t-xl"
          placeholder="empty"
          {...(priority ? { priority: true } : { loading: "lazy" })}
          onError={() => setImgSrc("/placeholder.webp")}
          sizes="(max-width: 640px) 160px, (max-width: 1024px) 180px, 220px"
        />

        {/* Botón de favorito responsivo */}
        <button
          aria-label="Añadir a favoritos"
          className="absolute top-1 right-1 sm:top-2 sm:right-2 
                     p-1 sm:p-1.5 lg:p-2 
                     bg-pink-200 rounded-full hover:bg-pink-300 
                     transition-colors flex items-center justify-center z-10"
          title="Favorito"
          onClick={(e) => e.stopPropagation()}
        >
          <MdFavorite
            size={
              window?.innerWidth < 640
                ? 16
                : window?.innerWidth < 1024
                ? 18
                : 20
            }
            color="#E4405F"
          />
        </button>
      </div>

      {/* Info responsiva */}
      <div className="p-2 sm:p-3 lg:p-4 flex flex-col justify-between flex-1 min-h-0">
        <div className="space-y-1">
          {/* Nombre */}
          <h3
            className="font-medium text-gray-700 
                       text-xs sm:text-sm lg:text-base 
                       line-clamp-1"
          >
            {producto.name ?? "Producto sin nombre"}
          </h3>

          {/* Precio y tallas en filas separadas para evitar superposición */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span
                className="text-pink-500 font-bold 
                          text-sm sm:text-base lg:text-lg"
              >
                {Number.isFinite(minPrice)
                  ? `$${(minPrice as number).toFixed(2)}`
                  : "N/A"}
              </span>
            </div>

            <div className="text-right">
              <span
                className="text-gray-500 text-xs inline-block"
                translate="no"
              >
                {sizesCsv
                  ? `${sizesCsv.split(", ").slice(0, 3).join(", ")}${
                      sizesCsv.split(", ").length > 3 ? "..." : ""
                    }`
                  : "Sin tallas"}
              </span>
            </div>
          </div>
        </div>

        {/* Descripción corta */}
        {producto.description && (
          <div className="mt-2 flex-shrink-0">
            <p
              className="text-gray-600 
                        text-xs lg:text-sm 
                        line-clamp-1 sm:line-clamp-2"
            >
              {producto.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
