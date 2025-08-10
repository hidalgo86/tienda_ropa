"use client";
import Image from "next/image";
import { useState } from "react";
import { MdOutlineMenu } from "react-icons/md";

const imagenes = [
  { src: "/dashboard/clientes.png", alt: "Clientes" },
  { src: "/dashboard/proveedores.png", alt: "Proveedores" },
  { src: "/dashboard/productos.png", alt: "Productos" },
  { src: "/dashboard/finanzas.png", alt: "Finanzas" },
  { src: "/dashboard/salir.png", alt: "Salir" },
];

interface MenuProps {
  opcion: string;
  setOpcion: (opcion: string) => void;
}

export default function Menu({ opcion, setOpcion }: MenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ backgroundColor: "#AEEFFF", height: "64px" }}
      className="flex sm:justify-around items-center relative w-full sm:p-11"
    >
      {/* Móvil: menú hamburguesa y logo */}
      <div className="flex items-center gap-4 sm:hidden relative w-full h-full">
        <MdOutlineMenu
          className="ml-2"
          size={28}
          onClick={() => setOpen((prev) => !prev)}
        />
        <div className="flex-1 flex justify-center items-center h-full">
          <Image
            src="/logo.png"
            alt="Logo tienda"
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
            className="h-full w-auto"
          />
        </div>
        {open && (
          <div className="absolute left-0 top-12 w-40 bg-white rounded shadow-lg z-50 py-2">
            {imagenes.map((img, idx) => (
              <button
                key={idx}
                className={`flex flex-col items-center w-full px-2 py-2 ${
                  opcion === img.alt ? "font-bold text-blue-600" : ""
                }`}
                onClick={() => {
                  setOpcion(img.alt);
                  setOpen(false);
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={32}
                  height={32}
                  className="m-auto"
                />
                <span className="text-xs text-center">{img.alt}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Escritorio/tablet: botones horizontales y logo centrado */}
      <div className="hidden sm:flex items-center justify-center w-full h-full relative">
        {imagenes.map((img, idx) => (
          <button
            key={idx}
            className={`flex flex-col ${
              opcion === img.alt ? "font-bold text-blue-600" : ""
            }`}
            onClick={() => setOpcion(img.alt)}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={50}
              height={50}
              className="m-auto"
            />
            <span className="w-27 text-center">{img.alt}</span>
          </button>
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full flex items-center sm:hidden">
          <Image
            src="/logo.png"
            alt="Logo tienda"
            height={64}
            width={160}
            style={{ objectFit: "contain" }}
            className="h-full w-auto"
          />
        </div>
      </div>
    </div>
  );
}
