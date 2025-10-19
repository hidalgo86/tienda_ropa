import Image from "next/image";
import Link from "next/link";

const imagenes = [
  { src: "/dashboard/productos.png", alt: "products", label: "Productos" },
  { src: "/dashboard/clientes.png", alt: "clients", label: "Clientes" },
  { src: "/dashboard/proveedores.png", alt: "providers", label: "Proveedores" },
  { src: "/dashboard/finanzas.png", alt: "finance", label: "Finanzas" },
  { src: "/dashboard/salir.png", alt: "exit", label: "Salir" },
];

export default function Menu({ option }: { option: string }) {
  return (
    <>
      {/* Escritorio/tablet: menú lateral vertical */}
      <div className="hidden md:flex flex-col items-center justify-start w-full h-full gap-6 pt-4">
        {imagenes.map((img, idx) => (
          <Link
            key={idx}
            href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
            className={`flex flex-col items-center w-full p-3 rounded-lg transition-colors ${
              option === img.alt
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={40}
              height={40}
              className="mb-2"
            />
            <span className="text-xs text-center">{img.label}</span>
          </Link>
        ))}
      </div>

      {/* Móvil: menú inferior tipo Instagram */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg safe-area-inset-bottom">
        <div className="flex justify-around items-center py-2 px-2">
          {imagenes.map((img, idx) => (
            <Link
              key={idx}
              href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 ${
                option === img.alt
                  ? "text-blue-600"
                  : "text-gray-600 active:text-gray-900"
              }`}
            >
              <div
                className={`p-2 rounded-full transition-colors ${
                  option === img.alt ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={20}
                  height={20}
                  className="flex-shrink-0"
                />
              </div>
              <span
                className={`text-xs mt-1 text-center truncate w-full ${
                  option === img.alt ? "font-semibold" : "font-normal"
                }`}
              >
                {img.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
