import Image from "next/image";

interface Producto {
  src: string;
  alt: string;
  nombre: string;
  descripcion: string;
  precio: string;
}

interface CardProps {
  producto: Producto;
}

export default function Card({ producto }: CardProps) {
  return (
    <div className="max-w-xs bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <Image
        src={producto.src}
        alt={producto.alt}
        width={320}
        height={240}
        className="w-full h-48 object-contain"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {producto.nombre}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{producto.descripcion}</p>
        <div className="flex items-center justify-between">
          <span className="text-blue-600 font-bold text-lg">
            {producto.precio}
          </span>
          <button className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded transition">
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
