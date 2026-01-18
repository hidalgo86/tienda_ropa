"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdFavorite, MdFavoriteBorder, MdShoppingCart } from "react-icons/md";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProductServer } from "@/types/product.type";
import { RootState } from "@/store";
import { toggleFavorite } from "@/store/slices/favoriteSlice";
import { addToCart } from "@/store/slices/cartSlice";

interface CardProps {
  producto: ProductServer;
  priority?: boolean;
}

export default function Card({ producto, priority = false }: CardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [imgSrc, setImgSrc] = useState(
    producto.imageUrl ?? "/placeholder.webp"
  );

  // Verificar si el producto está en favoritos
  const isFavorite = useSelector((state: RootState) =>
    state.favorites.items.some((item) => item.id === producto.id)
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
      router.push(`/products/${producto.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite(producto));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Obtener la primera talla disponible si existe
    const firstSize =
      Array.isArray(variants) && variants.length > 0
        ? variants[0]?.size
        : undefined;

    dispatch(
      addToCart({
        product: producto,
        quantity: 1,
        selectedSize: firstSize,
      })
    );
  };

  return (
    <div
      className="w-full max-w-[160px] sm:max-w-[180px] lg:max-w-[220px] 
                 h-[280px] sm:h-[320px] lg:h-[360px] 
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
          aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 
                     p-1 sm:p-1.5 lg:p-2 
                     bg-white/90 rounded-full hover:bg-white 
                     transition-all duration-200 flex items-center justify-center z-10
                     shadow-md hover:shadow-lg hover:scale-110"
          title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          onClick={handleFavoriteClick}
        >
          {isFavorite ? (
            <MdFavorite className="text-red-500" size={16} />
          ) : (
            <MdFavoriteBorder
              className="text-gray-500 hover:text-red-500"
              size={16}
            />
          )}
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

        {/* Botón  al carrito */}
        <div className="mt-3 pt-2">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 
                       py-2 px-3 bg-blue-500 hover:bg-blue-600 
                       text-white rounded-lg transition-all duration-200 
                       text-xs sm:text-sm font-medium
                       hover:scale-105 active:scale-95"
            aria-label="Agregar al carrito"
          >
            <MdShoppingCart size={14} />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
