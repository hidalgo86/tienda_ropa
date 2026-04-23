import Link from "next/link";
import Image from "next/image";
import { FaInstagram } from "react-icons/fa";

const socialLinks = [
  {
    href: "https://instagram.com/chikitoslandia",
    label: "Siguenos en Instagram",
    Icon: FaInstagram,
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t border-pink-200 bg-pink-50 
                       mt-6 sm:mt-10 lg:mt-16 
                       mb-20 sm:mb-24 lg:mb-0"
    >
      <div
        className="max-w-7xl mx-auto 
                      grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-12
                      px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      >
        <div
          className="col-span-1 flex flex-col items-center 
                        sm:col-span-2 sm:items-start lg:col-span-1"
        >
          <Image
            src="/chikitoslandia.png"
            alt="Logo ChikitosLandia"
            width={160}
            height={48}
            className="mb-3 object-contain sm:mb-4 sm:h-[54px] sm:w-[180px] lg:h-[60px] lg:w-[200px]"
          />
          <p
            className="max-w-xs text-center text-xs text-gray-600 
                        sm:max-w-none sm:text-left sm:text-sm lg:text-base"
          >
            ChikitosLandia. Ropa tierna y comoda para los mas pequenos de la
            casa.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <h3
            className="mb-2 text-sm font-semibold text-gray-800 
                         sm:mb-3 sm:text-base lg:mb-4 lg:text-lg"
          >
            Siguenos
          </h3>
          <div className="flex gap-3 text-pink-500 sm:gap-4 lg:gap-6">
            {socialLinks.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="rounded-full p-2 transition-all duration-200 hover:bg-pink-100 sm:p-1"
              >
                <Icon className="size-5 transition-colors hover:text-pink-700 lg:size-6" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-start">
          <h3
            className="mb-2 text-sm font-semibold text-gray-800 
                         sm:mb-3 sm:text-base lg:mb-4 lg:text-lg"
          >
            Suscribete
          </h3>
          <p
            className="mb-3 max-w-xs text-center text-xs text-gray-600 
                        sm:mb-4 sm:max-w-none sm:text-left sm:text-sm lg:text-base"
          >
            Recibe ofertas y novedades exclusivas en tu correo.
          </p>
          <form className="flex w-full max-w-xs flex-col gap-2 sm:max-w-none sm:gap-3">
            <input
              type="email"
              placeholder="Tu correo electronico"
              className="w-full rounded-lg border border-gray-300 
                         px-3 py-2 text-xs transition-all duration-200
                         focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300
                         sm:px-4 sm:py-2.5 sm:text-sm lg:text-base"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-pink-500 px-4 py-2 text-xs font-medium text-white
                         transition-all duration-200 hover:bg-pink-600 active:bg-pink-700
                         sm:w-auto sm:px-6 sm:py-2.5 sm:text-sm lg:text-base"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </div>

      <div
        className="border-t border-pink-200 bg-pink-100 py-3 text-center text-xs text-gray-600
                      sm:py-4 sm:text-sm lg:py-5 lg:text-base"
      >
        <p>
          © {new Date().getFullYear()} ChikitosLandia. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
