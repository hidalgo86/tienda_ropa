import Image from "next/image";
import Link from "next/link";

const imagenes = [
  { src: "/dashboard/clientes.png", alt: "clients" },
  { src: "/dashboard/proveedores.png", alt: "providers" },
  { src: "/dashboard/productos.png", alt: "products" },
  { src: "/dashboard/finanzas.png", alt: "finance" },
  { src: "/dashboard/salir.png", alt: "exit" },
];


export default function Menu({ option }: { option: string }) {
  return (
    <div className="flex sm:justify-around items-center relative w-full sm:p-11">
      {/* Escritorio/tablet: menú vertical */}
      <div className="hidden md:flex flex-col items-center justify-start w-full h-full gap-6 pt-4">
        {imagenes.map((img, idx) => (
          <Link
            key={idx}
            href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
            className={`flex flex-col items-center w-full ${
              option === img.alt ? "font-bold text-blue-600" : ""
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={50}
              height={50}
              className="m-auto"
            />
            <span className="w-27 text-center">{img.alt}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
