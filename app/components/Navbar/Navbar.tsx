"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaFacebookSquare,
  FaInstagram,
  FaSearch,
  FaHeart,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";

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
      style={{ backgroundColor: "#FF93B3" }}
      className="pr-5 pl-5 sm:pr-10 sm:pl-10 xl:pr-30 xl:pl-30 flex items-center justify-around relative h-50"
    >
      {/* IZQUIERDA: Facebook, Instagram, Buscar (solo sm y arriba) */}
      <div
        className="hidden sm:flex items-center gap-4 flex-1 transition-all duration-300 justify-start"
        style={{
          backgroundColor: "#8AEAFB",
          borderRadius: "12px 0 0 12px",
          padding: "8px 16px",
          minWidth: "120px",
          maxWidth: "600px",
        }}
      >
        <button title="Facebook">
          <FaFacebookSquare size={28} color="#1877F3" />
        </button>
        <button title="Instagram">
          <FaInstagram size={28} color="#E4405F" />
        </button>
      </div>

      {/* Menú hamburguesa solo en xs */}
      <div className="flex sm:hidden items-center relative">
        <button title="Menú" onClick={() => setOpen(!open)}>
          <svg
            width="32"
            height="32"
            fill="none"
            stroke="#333"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-12 left-0 w-48 bg-white shadow-lg rounded-lg z-50 p-4 flex flex-col gap-2">
            <button className="text-left py-2 px-4 hover:bg-pink-100 rounded">
              Acceder
            </button>
            <button className="text-left py-2 px-4 hover:bg-pink-100 rounded">
              Contacto
            </button>
            <button className="text-left py-2 px-4 hover:bg-pink-100 rounded">
              Acerca
            </button>
            <button className="text-left py-2 px-4 hover:bg-pink-100 rounded">
              Salir
            </button>
          </div>
        )}
      </div>

      {/* CENTRO: Logo */}
      <div
        className="flex-1 flex justify-center items-center relative"
        style={{ height: "80px" }}
      >
        {/* Fondo azul */}
        <div
          className="hidden sm:flex  w-20 sm:w-70 md:w-100 xl:w-180 2xl:w-240 h-11"
          style={{ backgroundColor: "#8AEAFB" }}
        ></div>
        {/* Logo superpuesto */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center"
          style={{ zIndex: 2 }}
        >
          <div
            style={{ minWidth: 200, maxWidth: 300 }}
            className="flex justify-center drop-shadow-lg ml-20 ms:ml-0"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={300}
              height={190}
              className="sm:w-[300px] sm:h-[180px]"
            />
          </div>
        </div>
      </div>

      {/* DERECHA: Favorito, Carrito, Login */}
      <div
        className=" bg-[#FF93B3] sm:bg-[#8AEAFB] flex items-center gap-4 flex-1 justify-end transition-all duration-300 "
        style={{
          // backgroundColor: "#8AEAFB",
          borderRadius: "0 12px 12px 0",
          padding: "8px 16px",
          minWidth: "120px",
          maxWidth: "600px",
        }}
      >
        <button title="Favoritos">
          <FaHeart size={28} color="#E4405F" />
        </button>
        <button title="Carrito">
          <FaShoppingCart size={28} color="#7ED957" />
        </button>
        <button title="Iniciar sesión" className="hidden sm:flex">
          <FaUser size={28} color="#4DA3FF" />
        </button>
      </div>
    </div>
  );
}
