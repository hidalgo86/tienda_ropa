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
  { href: "/", icon: <MdHome />, label: "Inicio" },
  { href: "/products", icon: <MdStore />, label: "Productos" },
  { href: "/account", icon: <MdPerson />, label: "Cuenta" },
  { href: "/dashboard", icon: <MdBarChart />, label: "Dashboard" },
  { href: "/acerca", icon: <MdInfo />, label: "Acerca" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // 🔥 Simulación: número de productos en carrito
  const cartCount = 3;

  return (
    <>
      {/* Navbar superior */}
      <nav className="w-full bg-pink-50 shadow-md border-b border-pink-200 flex items-center justify-between px-4 h-16 sm:h-16 md:h-14 transition-all">
        {/* Logo */}
        <div className="flex items-center h-full overflow-hidden">
          <Link
            href="/"
            className="relative h-46 w-44 sm:w-56 md:w-64 overflow-hidden"
          >
            <Image
              src="/chikitoslandia.png"
              alt="Logo"
              fill
              priority
              unoptimized
              className="object-contain object-bottom"
            />
          </Link>
        </div>

        {/* Links en desktop */}
        <div className="hidden md:flex flex-1 justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 text-gray-700 hover:text-pink-500 transition-colors"
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
              className="text-pink-400 hover:text-pink-600 transition-colors"
            />
          </Link>

          {/* Carrito con badge */}
          <Link href="/cart" title="Carrito" className="relative">
            <MdShoppingCart
              size={24}
              className="text-sky-400 hover:text-sky-600 transition-colors"
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login solo visible en desktop */}
          <Link href="/login" title="Login" className="hidden md:inline">
            <MdLogin
              size={24}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            />
          </Link>

          {/* Botón Hamburguesa en móvil */}
          <button
            aria-label="Abrir menú"
            className="md:hidden text-gray-700 hover:text-pink-500 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
          </button>
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      <div
        className={`md:hidden bg-pink-50 shadow-md border-t border-pink-200 flex flex-col p-4 space-y-4 transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 text-gray-700 hover:text-pink-500 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Login en menú hamburguesa móvil */}
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-700 hover:text-pink-500 border-t pt-4 mt-2 transition-colors"
          onClick={() => setIsOpen(false)}
        >
          <MdLogin size={24} />
          <span>Login</span>
        </Link>
      </div>
    </>
  );
}
