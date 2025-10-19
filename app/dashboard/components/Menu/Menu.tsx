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
      {/* Desktop/Tablet: menú lateral vertical - solo visible en sidebar */}
      <div className="flex md:flex flex-col items-center justify-start w-full h-full gap-4 lg:gap-6 pt-4">
        {imagenes.map((img, idx) => (
          <Link
            key={idx}
            href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
            className={`flex flex-col items-center w-full p-2 lg:p-3 rounded-lg transition-all duration-200 ${
              option === img.alt
                ? "bg-blue-100 text-blue-600 font-semibold shadow-sm"
                : "hover:bg-gray-100 text-gray-700 hover:shadow-sm"
            }`}
          >
            <div className="flex flex-col items-center">
              <Image
                src={img.src}
                alt={img.alt}
                width={32}
                height={32}
                className="lg:w-10 lg:h-10 mb-1 lg:mb-2"
              />
              <span className="text-xs lg:text-sm text-center leading-tight">
                {img.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Móvil: menú inferior fijo - solo visible en móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-5 gap-1 py-2 px-2 safe-area-inset-bottom">
          {imagenes.map((img, idx) => (
            <Link
              key={idx}
              href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                option === img.alt
                  ? "text-blue-600"
                  : "text-gray-600 active:text-gray-900 hover:text-gray-800"
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  option === img.alt
                    ? "bg-blue-100"
                    : "hover:bg-gray-100 active:bg-gray-200"
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
                className={`text-xs mt-1 text-center truncate w-full leading-tight ${
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
