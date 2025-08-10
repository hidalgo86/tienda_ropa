"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FaFacebookSquare,
  FaInstagram,
  FaShoppingBasket,
  FaSearch,
} from "react-icons/fa";
import { MdOutlineMenu } from "react-icons/md";
import { useRouter } from "next/navigation";

const imagenes = [
  { src: "/menuCategoria/bebe.png", alt: "Bebé" },
  { src: "/menuCategoria/nino.png", alt: "Niño" },
  { src: "/menuCategoria/nina.png", alt: "Niña" },
  { src: "/menuCategoria/extra.png", alt: "Complementos" },
  { src: "/menuCategoria/marca.png", alt: "Marca" },
  { src: "/menuCategoria/cuenta.png", alt: "Mi cuenta" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div
      style={{ backgroundColor: "#AEEFFF" }}
      className="pr-10 pl-10 sm:pr-20 sm:pl-20 xl:pr-30 xl:pl-30 flex items-center justify-between relative"
    >
      {/* Icono menú hamburguesa */}
      <div className="block md:hidden relative">
        <MdOutlineMenu size={28} onClick={() => setOpen((prev) => !prev)} />
        {/* Menú desplegable con imágenes y nombres */}
        {open && (
          <ul className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg z-50 py-2 md:hidden">
            {imagenes.map((img, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  if (img.alt === "Mi cuenta") {
                    router.push("/dashboard");
                  }
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={28}
                  height={28}
                  className="shrink-0"
                />
                <span className="text-sm">{img.alt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <FaFacebookSquare
          size={20}
          className="sm:size-[32px]"
          color="#1877F3"
        />
        <FaInstagram size={20} className="sm:size-[32px]" color="#E4405F" />
      </div>

      <Image
        src="/logo.png"
        alt="Logo"
        width={150}
        height={150}
        className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px]"
      />

      <div className="flex items-center gap-4">
        <FaSearch size={20} className="md:size-[32px]" color="#333333" />
        <FaShoppingBasket
          size={20}
          className="md:size-[32px]"
          color="#E4405F"
        />
      </div>
    </div>
  );
}
