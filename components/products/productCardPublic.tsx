import React from "react";
import Image from "next/image";
import { Product } from "@/types/product.type";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProductCardPublicProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const PLACEHOLDER = "/placeholder.webp";

const ProductCardPublic: React.FC<ProductCardPublicProps> = ({
  product,
  onAddToCart,
  onFavorite,
}) => {
  const variants = product.variants ?? [];
  const minPrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => Number(v.price) || 0))
      : null;
  // Nota: 'sizes' no se usa en la UI actual
  const isEliminado = product.status?.toLowerCase() === "eliminado";
  const isFavorite = useSelector((state: RootState) =>
    state.favorites?.items?.some((item) => item.id === product.id)
  );

  return (
    <div
      className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 border flex flex-col overflow-hidden group"
      tabIndex={0}
      aria-label={`Tarjeta producto ${product.name}`}
    >
      {/* Imagen */}
      <div className="w-full h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        <Image
          src={product.imageUrl || PLACEHOLDER}
          alt={product.name}
          width={224}
          height={192}
          className="object-cover w-full h-full"
        />
      </div>
      {/* Botón de favorito arriba a la derecha: sin círculo */}
      {!isEliminado && onFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => onFavorite(product.id)}
            className="p-0 bg-transparent shadow-none focus:outline-none hover:opacity-80"
            title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-label={
              isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
            }
          >
            {isFavorite ? (
              // Corazón rojo sólido cuando está en favoritos
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#EF4444">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              // Corazón blanco con borde rojo cuando NO está en favoritos
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFFFFF">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      )}
      {/* Info principal: solo nombre y precio con carrito a la derecha */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="font-bold text-base text-gray-900">{product.name}</div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg text-gray-900">
            ${Number(minPrice ?? 0).toFixed(2)}
          </div>
          {!isEliminado &&
            (onAddToCart ? (
              <button
                onClick={() => onAddToCart(product.id)}
                className="text-blue-600 hover:text-blue-700 p-2 focus:outline-none"
                title="Agregar al carrito"
                aria-label="Agregar al carrito"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3h2l3.4 12h9.6l2-7H6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10.5" cy="19" r="1.5" fill="currentColor" />
                  <circle cx="17.5" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </button>
            ) : (
              <div className="text-blue-600 p-2" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3h2l3.4 12h9.6l2-7H6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10.5" cy="19" r="1.5" fill="currentColor" />
                  <circle cx="17.5" cy="19" r="1.5" fill="currentColor" />
                </svg>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCardPublic;
