"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MdFavorite,
  MdShoppingCart,
  MdLogin,
  MdStore,
  MdHome,
  MdPerson,
  MdBarChart,
  MdInfo,
} from "react-icons/md";

const navLinks = [
  { href: "/", icon: <MdHome size={28} />, label: "Home" },
  { href: "/products", icon: <MdStore size={28} />, label: "Productos" },
  { href: "/account", icon: <MdPerson size={28} />, label: "Account" },
  { href: "/dashboard", icon: <MdBarChart size={28} />, label: "Dashboard" },
  { href: "/acerca", icon: <MdInfo size={28} />, label: "Acerca" },
];

export default function Navbar() {
  return (
    <nav
      className="w-full bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-4"
      style={{ height: 110 }}
    >
      {/* Logo a la izquierda */}
      <div className="flex items-center h-full">
        <Link href="/">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={1400}
            height={180}
            priority
            className="mr-6"
            style={{ maxHeight: 152, width: "auto" }}
          />
        </Link>
      </div>
      {/* Navegación principal en el centro (solo iconos) */}
      <div className="flex-1 flex justify-center h-full gap-16 md:gap-12 sm:gap-8 xs:gap-4 transition-all duration-200">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="h-full flex items-center justify-center rounded transition focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-blue-100 hover:text-blue-600 text-gray-700 px-2"
            style={{ minWidth: 64, minHeight: 44 }}
            title={link.label}
          >
            {React.cloneElement(link.icon, {
              size: 32,
              color:
                link.label === "Home"
                  ? "#2563eb" // azul
                  : link.label === "Products"
                  ? "#16a34a" // verde
                  : link.label === "Account"
                  ? "#f59e42" // naranja
                  : link.label === "Dashboard"
                  ? "#a21caf" // morado
                  : link.label === "Acerca"
                  ? "#0ea5e9" // celeste
                  : undefined,
            })}
          </Link>
        ))}
      </div>
      {/* Iconos a la derecha */}
      <div className="flex gap-4 items-center h-full">
        <Link
          href="/favorito"
          title="Favoritos"
          className="h-full flex items-center"
        >
          <MdFavorite size={28} className="text-pink-500 hover:text-pink-600" />
        </Link>
        <Link href="/cart" title="Carrito" className="h-full flex items-center">
          <MdShoppingCart
            size={28}
            className="text-blue-500 hover:text-blue-600"
          />
        </Link>
        <Link href="/login" title="Login" className="h-full flex items-center">
          <MdLogin size={28} className="text-gray-500 hover:text-gray-700" />
        </Link>
      </div>
    </nav>
  );
}
// ...existing code...
import React from "react";
