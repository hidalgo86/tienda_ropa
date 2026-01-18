import Image from "next/image";
import { Product } from "@/types/product.type";

interface CardProps {
  product: Product;
  admin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onAddToCart?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  disponible: "bg-green-100 text-green-700 border-green-300",
  agotado: "bg-red-100 text-red-700 border-red-300",
  eliminado: "bg-gray-200 text-gray-500 border-gray-400",
};

const PLACEHOLDER = "/placeholder.webp";

function Card({
  product,
  admin = false,
  onEdit,
  onDelete,
  onRestore,
  onAddToCart,
  onFavorite,
}: CardProps) {
  const status = product.status?.toLowerCase();
  const isEliminado = status === "eliminado";

  const variants = product.variants ?? [];
  const minPrice =
    variants.length > 0
      ? Math.min(...variants.map((v) => Number(v.price) || 0))
      : null;
  const sizes =
    variants.length > 0 ? variants.map((v) => v.size).join(", ") : null;

  return (
    <div
      className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 border flex flex-col overflow-hidden group"
      tabIndex={0}
      aria-label={`Tarjeta producto ${product.name}`}
    >
      <div className="w-full h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        <Image
          src={product.imageUrl || PLACEHOLDER}
          alt={product.name}
          width={224}
          height={192}
          className="object-cover w-full h-full"
        />
        {admin && (
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold border shadow ${
              statusColors[status || ""] ||
              "bg-gray-100 text-gray-500 border-gray-300"
            }`}
            style={{ zIndex: 2 }}
          >
            {product.status}
          </span>
        )}
      </div>
      {/* Botones de acción solo si admin */}
      {!isEliminado && admin && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          {onEdit && (
            <button
              onClick={() => onEdit(product.id)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow focus:outline-none"
              title="Editar producto"
              aria-label="Editar producto"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.475 5.408a2.357 2.357 0 1 1 3.336 3.336L7.5 21.055l-4.5 1.5 1.5-4.5 11.975-12.647Z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow focus:outline-none"
              title="Eliminar producto"
              aria-label="Eliminar producto"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 6L6 18M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      {/* Botones de acción para cliente (carrito y favorito) */}
      {!isEliminado && !admin && (onAddToCart || onFavorite) && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow focus:outline-none"
              title="Agregar al carrito"
              aria-label="Agregar al carrito"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h15l-1.5 9h-13zM6 6V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2"
                />
              </svg>
            </button>
          )}
          {onFavorite && (
            <button
              onClick={() => onFavorite(product.id)}
              className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full shadow focus:outline-none"
              title="Agregar a favoritos"
              aria-label="Agregar a favoritos"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      {/* Botón restaurar si eliminado */}
      {isEliminado && onRestore && (
        <button
          onClick={() => onRestore(product.id)}
          className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow text-xs font-medium"
          title="Restablecer producto"
          aria-label="Restablecer producto"
        >
          Restablecer
        </button>
      )}

      {/* Info principal */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Nombre con tooltip */}
        <div className="font-bold text-base text-gray-900 mb-1 relative group">
          <span
            tabIndex={0}
            className="cursor-pointer"
            aria-label={product.description || "Sin descripción"}
          >
            {product.name}
          </span>
          {product.description && (
            <span className="absolute left-0 top-full mt-1 w-max max-w-xs bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-20">
              {product.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">{product.genre}</span>
        </div>
        {/* Variantes */}
        <div className="mt-auto pt-2 text-sm text-gray-700 flex justify-between items-end">
          {variants.length > 0 ? (
            <>
              <div>
                <span className="font-semibold">Tallas:</span> {sizes}
              </div>
              <div className="font-bold text-lg text-gray-900 text-right min-w-[80px]">
                ${minPrice?.toFixed(2)}
              </div>
            </>
          ) : (
            <div className="text-gray-400">Sin variantes disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
// crear un componente de tarjeta reutilizable para el dashboard
// que acepte props del producto y muestre la información relevante
// Product {
//   id: string;
//   name: string;
//   genre: Genre;
//   description?: string;
//   variants?: VariantProduct[];
//   imageUrl?: string;
//   imagePublicId?: string;
//   status: ProductStatus;
//   createdAt: string;
//   updatedAt: string;
// }
// Mostrar imagen, nombre, género, precio mínimo, tallas disponibles, estado
// Usar Tailwind CSS para estilos responsivos y modernos
// Incluir un botón de acción para editar o eliminar el producto
// Asegurarse de que el componente sea accesible y siga buenas prácticas de UI/UX
// Exportar el componente para su uso en otras partes del dashboard
// Incluir manejo de estados de carga o error si es necesario
// Asegurarse de que el componente sea probado y funcione correctamente
// con diferentes tipos de datos de productos
// y en diferentes tamaños de pantalla
// Incluir comentarios en el código para mayor claridad
// Asegurarse de que el componente sea compatible con TypeScript
// el tipado esta en types/product.type.ts
// el boton de editar y eliminar debe ir en la esquina superior derecha de la tarjeta
// el estado del producto debe mostrarse con un color diferente segun el estado
// (disponible: verde, agotado: rojo, eliminado: gris)
// el precio minimo y tallas disponibles deben mostrarse en la parte inferior de la tarjeta
// la descripcion del producto debe mostrarse en un tooltip al pasar el mouse sobre el nombre del producto
// la imagen del producto debe tener un tamaño fijo y mantener la proporción
// el componente debe ser responsivo y adaptarse a diferentes tamaños de pantalla
// el componente debe tener una sombra sutil y un borde redondeado
// el componente debe tener una animación suave al pasar el mouse sobre él
// el componente debe tener un diseño limpio y moderno
// si el estado del producto es eliminado, el boton de editar y  eliminar no debe mostrarse
// debe aparecer un boton para restablecer el producto si su estado es eliminado
// si esta en estado agotado o disponible, el boton de restablecer no debe mostrarse
// si el producto no tiene imagen, debe mostrarse una imagen placeholder
// si el producto no tiene variantes, debe mostrarse "Sin variantes disponibles" en lugar del precio y tallas
// el componente debe ser exportado como default
// el componente debe estar en la carpeta app/dashboard/components/Card.ts
