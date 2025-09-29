"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdFavorite, MdShoppingCart } from "react-icons/md";
import { Product } from "../../types/products";
import { useState } from "react";

interface CardProps {
  producto: Partial<Product>;
  priority?: boolean;
}

export default function Card({ producto, priority = false }: CardProps) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    producto.imageUrl ?? "/placeholder.webp"
  );

  const handleClick = () => {
    if (producto.id) {
      const productoParam = encodeURIComponent(JSON.stringify(producto));
      router.push(`/detalle?producto=${productoParam}`);
    }
  };

  return (
    <div
      className="w-[210px] h-[360px] bg-pink-50 rounded-xl shadow-lg overflow-hidden border border-pink-100 relative cursor-pointer flex flex-col hover:scale-105 hover:shadow-xl transition-transform duration-300"
      onClick={handleClick}
      style={{ minWidth: 210, maxWidth: 210 }}
    >
      {/* Imagen */}
      <div className="w-full h-[210px] flex items-center justify-center bg-pink-100 relative">
        <Image
          src={imgSrc}
          alt={producto.name ? `Imagen de ${producto.name}` : "Producto sin nombre"}
          width={210}
          height={210}
          className="object-cover w-full h-full rounded-t-xl"
          placeholder="empty"
          {...(priority ? { priority: true } : { loading: "lazy" })}
          onError={() => setImgSrc("/placeholder.webp")}
          sizes="(max-width: 768px) 100vw, 210px"
        />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nombre */}
        <h3 className="font-medium text-gray-700 text-sm mb-1 line-clamp-1">
          {producto.name ?? "Producto sin nombre"}
        </h3>

        {/* Precio y tallas */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-pink-500 font-bold text-lg">
            {typeof producto.price === "number"
              ? `$${producto.price}`
              : producto.price}
          </span>
          <span className="text-gray-500 text-xs">
            {producto.size && producto.size.length > 0
              ? `Talla: ${producto.size.join(", ")}`
              : "Sin talla"}
          </span>
        </div>

        {/* Descripción corta */}
        {producto.description && (
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {producto.description}
          </p>
        )}

        <div className="flex-1" />

        {/* Botones de acción */}
        <div className="flex items-center justify-between gap-2">
          {/* Favorito */}
          <button
            aria-label="Añadir a favoritos"
            className="p-2 bg-pink-200 rounded-full hover:bg-pink-300 transition-colors flex items-center justify-center"
            title="Favorito"
            onClick={(e) => {
              e.stopPropagation();
              // lógica de favorito aquí
            }}
          >
            <MdFavorite size={22} color="#E4405F" />
          </button>

          {/* Carrito */}
          <button
            aria-label="Añadir al carrito"
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-sm bg-sky-200 hover:bg-sky-300 text-white transition-colors"
            title="Añadir al carrito"
            onClick={(e) => {
              e.stopPropagation();
              // lógica carrito aquí
            }}
          >
            <MdShoppingCart size={20} />
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}

