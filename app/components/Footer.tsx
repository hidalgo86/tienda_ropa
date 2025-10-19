"use client";

import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="bg-pink-50 border-t border-pink-200 
                       mt-6 sm:mt-10 lg:mt-16 
                       mb-16 sm:mb-20 md:mb-0"
    >
      <div
        className="max-w-7xl mx-auto 
                      px-3 sm:px-6 lg:px-8 
                      py-6 sm:py-10 lg:py-12 
                      grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
                      gap-6 sm:gap-8 lg:gap-12"
      >
        {/* Logo + descripción */}
        <div
          className="flex flex-col items-center sm:items-start 
                        col-span-1 sm:col-span-2 lg:col-span-1"
        >
          <Image
            src="/chikitoslandia.png"
            alt="Logo ChikitosLandia"
            width={160}
            height={48}
            className="sm:w-[180px] sm:h-[54px] lg:w-[200px] lg:h-[60px] 
                       object-contain mb-3 sm:mb-4"
          />
          <p
            className="text-gray-600 
                        text-xs sm:text-sm lg:text-base 
                        text-center sm:text-left 
                        max-w-xs sm:max-w-none"
          >
            ChikitosLandia 👶💕 Ropa tierna y cómoda para los más pequeños de la
            casa.
          </p>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col items-center sm:items-start">
          <h3
            className="text-gray-800 font-semibold 
                         text-sm sm:text-base lg:text-lg 
                         mb-2 sm:mb-3 lg:mb-4"
          >
            Síguenos
          </h3>
          <div className="flex gap-3 sm:gap-4 lg:gap-6 text-pink-500">
            <Link
              href="https://facebook.com"
              target="_blank"
              aria-label="Síguenos en Facebook"
              className="p-2 sm:p-1 hover:bg-pink-100 rounded-full transition-all duration-200"
            >
              <FaFacebook
                size={
                  window?.innerWidth < 640
                    ? 20
                    : window?.innerWidth < 1024
                    ? 22
                    : 24
                }
                className="hover:text-pink-700 transition-colors"
              />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              aria-label="Síguenos en Instagram"
              className="p-2 sm:p-1 hover:bg-pink-100 rounded-full transition-all duration-200"
            >
              <FaInstagram
                size={
                  window?.innerWidth < 640
                    ? 20
                    : window?.innerWidth < 1024
                    ? 22
                    : 24
                }
                className="hover:text-pink-700 transition-colors"
              />
            </Link>
            <Link
              href="https://tiktok.com"
              target="_blank"
              aria-label="Síguenos en TikTok"
              className="p-2 sm:p-1 hover:bg-pink-100 rounded-full transition-all duration-200"
            >
              <FaTiktok
                size={
                  window?.innerWidth < 640
                    ? 20
                    : window?.innerWidth < 1024
                    ? 22
                    : 24
                }
                className="hover:text-pink-700 transition-colors"
              />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col items-center sm:items-start">
          <h3
            className="text-gray-800 font-semibold 
                         text-sm sm:text-base lg:text-lg 
                         mb-2 sm:mb-3 lg:mb-4"
          >
            Suscríbete
          </h3>
          <p
            className="text-gray-600 
                        text-xs sm:text-sm lg:text-base 
                        text-center sm:text-left 
                        mb-3 sm:mb-4 
                        max-w-xs sm:max-w-none"
          >
            Recibe ofertas y novedades exclusivas en tu correo.
          </p>
          <form className="flex flex-col w-full max-w-xs sm:max-w-none gap-2 sm:gap-3">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="px-3 sm:px-4 py-2 sm:py-2.5 
                         rounded-lg border border-gray-300 
                         focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                         text-xs sm:text-sm lg:text-base 
                         w-full transition-all duration-200"
            />
            <button
              type="submit"
              className="bg-pink-500 text-white 
                         px-4 sm:px-6 py-2 sm:py-2.5 
                         rounded-lg hover:bg-pink-600 active:bg-pink-700
                         transition-all duration-200 
                         text-xs sm:text-sm lg:text-base 
                         font-medium w-full sm:w-auto"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div
        className="bg-pink-100 text-gray-600 text-center 
                      py-3 sm:py-4 lg:py-5 
                      text-xs sm:text-sm lg:text-base
                      border-t border-pink-200"
      >
        <p>
          © {new Date().getFullYear()} ChikitosLandia. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
