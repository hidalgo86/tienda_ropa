"use client";

import React, { useState } from "react";
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
  MdMenu,
  MdClose,
} from "react-icons/md";

const navLinks = [
  { href: "/", icon: <MdHome />, label: "Home" },
  { href: "/products", icon: <MdStore />, label: "Productos" },
  { href: "/account", icon: <MdPerson />, label: "Account" },
  { href: "/dashboard", icon: <MdBarChart />, label: "Dashboard" },
  { href: "/acerca", icon: <MdInfo />, label: "Acerca" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Navbar superior */}
      <nav className="w-full bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-4 h-16 sm:h-16 md:h-14 transition-all">
        {/* Logo */}
        <div className="flex items-center h-full overflow-hidden">
          <Link
            href="/"
            className="relative h-16 w-44 sm:w-56 md:w-64 overflow-hidden"
          >
            <Image
              src="/chikitoslandia.png"
              alt="Logo"
              fill
              priority
              unoptimized
              className="object-cover"
              style={{
                objectPosition:
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? "center 50%"
                    : "center 50%",
              }}
            />
          </Link>
        </div>

        {/* Links en desktop */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Iconos a la derecha */}
        <div className="flex gap-4 items-center">
          <Link href="/favorito" title="Favoritos">
            <MdFavorite
              size={24}
              className="text-pink-500 hover:text-pink-600"
            />
          </Link>
          <Link href="/cart" title="Carrito">
            <MdShoppingCart
              size={24}
              className="text-blue-500 hover:text-blue-600"
            />
          </Link>

          {/* Login solo visible en desktop */}
          <Link href="/login" title="Login" className="hidden md:inline">
            <MdLogin size={24} className="text-gray-500 hover:text-gray-700" />
          </Link>

          {/* Botón Hamburguesa en móvil */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
          </button>
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200 flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
              onClick={() => setIsOpen(false)} // cerrar menú al hacer click
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          {/* Login en menú hamburguesa móvil */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border-t pt-4 mt-2"
            onClick={() => setIsOpen(false)}
          >
            <MdLogin size={24} />
            <span>Login</span>
          </Link>
        </div>
      )}
    </>
  );
}
