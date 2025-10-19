"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-pink-50 border-t border-pink-200 mt-10 mb-20 md:mb-0">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + descripción */}
        <div className="flex flex-col items-start">
          <Image
            src="/chikitoslandia.png"
            alt="Logo"
            width={200}
            height={60}
            className="object-contain mb-3"
          />
          <p className="text-gray-600 text-sm">
            ChikitosLandia 👶💕 Ropa tierna y cómoda para los más pequeños de la
            casa.
          </p>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col">
          <h3 className="text-gray-800 font-semibold mb-3">Síguenos</h3>
          <div className="flex gap-4 text-pink-500">
            <Link
              href="https://facebook.com"
              target="_blank"
              aria-label="Facebook"
            >
              <FaFacebook
                size={22}
                className="hover:text-pink-700 transition-colors"
              />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              aria-label="Instagram"
            >
              <FaInstagram
                size={22}
                className="hover:text-pink-700 transition-colors"
              />
            </Link>
            <Link href="https://tiktok.com" target="_blank" aria-label="TikTok">
              <FaTiktok
                size={22}
                className="hover:text-pink-700 transition-colors"
              />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-3">Suscríbete</h3>
          <p className="text-gray-600 text-sm mb-3">
            Recibe ofertas y novedades exclusivas en tu correo.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Tu correo"
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm w-full"
            />
            <button
              type="submit"
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-pink-100 text-gray-600 text-center py-4 text-sm">
        © {new Date().getFullYear()} ChikitosLandia. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
