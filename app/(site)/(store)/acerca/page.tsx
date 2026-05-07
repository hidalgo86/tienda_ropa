import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import {
  MdLocationOn,
  MdLocalShipping,
  MdPayments,
  MdStorefront,
  MdSupportAgent,
  MdVerified,
} from "react-icons/md";

export const metadata: Metadata = {
  title: "Acerca de Chikitoslandia",
  description:
    "Conoce Chikitoslandia, tienda online y fisica de ropa, juguetes y articulos para bebes y ninos.",
  alternates: {
    canonical: "/acerca",
  },
  openGraph: {
    title: "Acerca de Chikitoslandia",
    description:
      "Conoce Chikitoslandia, tienda online y fisica de ropa, juguetes y articulos para bebes y ninos.",
    url: "/acerca",
    type: "website",
  },
};

const highlights = [
  {
    Icon: MdStorefront,
    title: "Tienda para peques",
    text: "Ropa, juguetes y articulos seleccionados para bebes, ninos y ninas.",
  },
  {
    Icon: MdSupportAgent,
    title: "Atencion cercana",
    text: "Te ayudamos con tallas, disponibilidad y dudas antes de preparar tu compra.",
  },
  {
    Icon: MdLocalShipping,
    title: "Envios coordinados",
    text: "Despachos y entregas se acuerdan segun destino y disponibilidad.",
  },
];

const values = [
  "Productos revisados antes de entregar",
  "Confirmacion de pago antes de preparar pedidos",
  "Comunicacion directa por redes sociales",
  "Catalogo pensado para comprar sin complicarte",
];

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <section className="relative overflow-hidden bg-pink-50">
          <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]">
            <div className="flex flex-col justify-center px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Una tienda cercana para vestir, cuidar y consentir a los mas
                  pequenos.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                  En Chikitoslandia reunimos productos utiles, comodos y bonitos
                  para bebes, ninos y ninas. Compras online con trato humano y
                  apoyo directo cuando necesitas elegir mejor.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700"
                  >
                    Ver productos
                  </Link>
                  <Link
                    href="https://instagram.com/chikitoslandia"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-pink-200 bg-white px-5 py-3 text-sm font-semibold text-pink-700 transition hover:bg-pink-100"
                  >
                    <FaInstagram size={20} />
                    Instagram
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center bg-white p-4 sm:p-6 lg:min-h-full lg:p-8">
              <Image
                src="/chikitoslandia-og.png"
                alt="Productos y estilo de Chikitoslandia"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
            {highlights.map(({ Icon, title, text }) => (
              <div key={title} className="bg-white px-5 py-7 sm:px-8">
                <div className="mb-4 inline-flex rounded-lg bg-pink-100 p-3 text-pink-700">
                  <Icon size={24} />
                </div>
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-pink-100 p-3 text-pink-700">
                  <MdLocationOn size={26} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Nos encontramos en Guiria
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-700">
                    Estamos ubicados en Calle Pagallos, Guiria, Estado Sucre,
                    frente a los chinos Fabiola. Puedes coordinar disponibilidad,
                    entrega o retiro antes de concretar tu compra.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <MdPayments className="text-pink-700" size={24} />
                <h2 className="text-xl font-bold text-slate-950">
                  Compra tranquila
                </h2>
              </div>
              <ul className="mt-5 space-y-3">
                {values.map((value) => (
                  <li key={value} className="flex gap-3 text-sm text-slate-700">
                    <MdVerified className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
