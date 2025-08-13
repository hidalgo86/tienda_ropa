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
          <button
            className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded transition flex items-center justify-center"
            title="Añadir al carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zM7.16 16l.84-2h7.18l.84 2H7.16zm12.16-2.25l-1.72-7.45A2.001 2.001 0 0 0 15.68 4H6.32l-.44-2H2v2h2l3.6 7.59-1.35 2.44C5.16 15.37 5.52 16 6.16 16h12.02c.64 0 1-.63.98-1.25z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
