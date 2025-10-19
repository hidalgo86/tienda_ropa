"use client";
import React from "react";
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
  { href: "/", icon: <MdHome />, label: "Inicio" },
  { href: "/products", icon: <MdStore />, label: "Productos" },
  { href: "/account", icon: <MdPerson />, label: "Cuenta" },
  { href: "/dashboard", icon: <MdBarChart />, label: "Dashboard" },
  { href: "/acerca", icon: <MdInfo />, label: "Acerca" },
];

export default function Navbar() {
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

        {/* Iconos a la derecha - Solo desktop */}
        <div className="hidden md:flex gap-4 items-center">
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

          <Link href="/login" title="Login">
            <MdLogin
              size={24}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            />
          </Link>
        </div>

        {/* Solo carrito visible en móvil */}
        <div className="md:hidden">
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
        </div>
      </nav>

      {/* Menú inferior tipo Instagram - Solo móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-200 z-50 shadow-lg">
        <div className="flex justify-around items-center py-2 px-2">
          {/* Inicio */}
          <Link
            href="/"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdHome size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Inicio
            </span>
          </Link>

          {/* Productos */}
          <Link
            href="/products"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdStore size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Productos
            </span>
          </Link>

          {/* Favoritos */}
          <Link
            href="/favorito"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdFavorite size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Favoritos
            </span>
          </Link>

          {/* Cuenta */}
          <Link
            href="/account"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdPerson size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Cuenta
            </span>
          </Link>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdBarChart size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Dashboard
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
