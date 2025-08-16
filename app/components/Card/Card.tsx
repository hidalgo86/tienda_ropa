"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MdFavorite, MdShoppingCart } from "react-icons/md";
import { Product } from "../../types/products";

export default function Card({ producto }: { producto: Partial<Product> }) {
  const router = useRouter();
  const handleClick = () => {
    if (producto.id) {
      const productoParam = encodeURIComponent(JSON.stringify(producto));
      router.push(`/detalle?producto=${productoParam}`);
    }
  };
  return (
    <div
      className=" max-w-xs bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 relative cursor-pointer"
      onClick={handleClick}
    >
      <Image
        src={producto.imageUrl ?? "/placeholder.webp"}
        alt={producto.name ?? "Producto sin nombre"}
        width={320}
        height={240}
        className="w-full h-48 object-cover"
        style={{ width: "320px", height: "240px" }}
      />
      <div className="p-4">
        {/* Precio y tallas */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-600 font-bold text-lg">
            {typeof producto.price === "number"
              ? `$${producto.price}`
              : producto.price}
          </span>
          <span className="text-gray-500 text-sm">
            {producto.size && producto.size.length > 0
              ? `Tallas: _${producto.size.join(", ")}`
              : "Sin tallas"}
          </span>
        </div>
        {/* Descripción opcional */}
        {producto.description && (
          <p className="text-gray-600 text-sm mb-4">{producto.description}</p>
        )}
        {/* Botones de acción */}
        <div className="flex items-center justify-end">
          <div className="flex items-center justify-between w-full">
            <button
              className="p-2 bg-transparent rounded-full hover:bg-pink-100 transition flex items-center justify-center"
              title="Favorito"
            >
              <MdFavorite size={24} color="#E4405F" />
            </button>
            <button
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
