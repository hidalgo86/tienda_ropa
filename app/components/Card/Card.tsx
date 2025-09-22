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
      className="w-[210px] h-[340px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative cursor-pointer flex flex-col"
      onClick={handleClick}
      style={{ minWidth: 210, maxWidth: 210, minHeight: 340, maxHeight: 340 }}
    >
      <div className="w-full h-[210px] flex items-center justify-center bg-gray-50">
        <Image
          src={imgSrc}
          alt={
            producto.name ? `Imagen de ${producto.name}` : "Producto sin nombre"
          }
          width={210}
          height={210}
          className="object-cover w-full h-full"
          placeholder="empty"
          {...(priority ? { priority: true } : { loading: "lazy" })}
          onError={() => setImgSrc("/placeholder.webp")}
          sizes="(max-width: 768px) 100vw, 210px"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        {/* Precio y tallas */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-600 font-bold text-lg">
            {typeof producto.price === "number"
              ? `$${producto.price}`
              : producto.price}
          </span>
          <span className="text-gray-500 text-sm">
            {producto.size && producto.size.length > 0
              ? `Tallas: ${producto.size.join(", ")}`
              : "Sin tallas"}
          </span>
        </div>
        {/* Descripción opcional */}
        {producto.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {producto.description}
          </p>
        )}
        <div className="flex-1" />
        {/* Botones de acción */}
        <div className="flex items-center justify-end">
          <div className="flex items-center justify-between w-full">
            <button
              aria-label="Añadir a favoritos"
              className="p-2 bg-transparent rounded-full hover:bg-pink-100 transition flex items-center justify-center"
              title="Favorito"
              onClick={(e) => {
                e.stopPropagation();
                // lógica de favorito aquí
              }}
            >
              <MdFavorite size={24} color="#E4405F" />
            </button>
            <button
              aria-label="Añadir al carrito"
              className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded transition flex items-center justify-center"
              title="Añadir al carrito"
            >
              <MdShoppingCart size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
