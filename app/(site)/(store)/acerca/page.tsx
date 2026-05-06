import type { Metadata } from "next";

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

export default function AcercaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Acerca de Chikitoslandia</h1>
          <p className="text-gray-700 mb-2">
            Bienvenido a nuestra tienda. Aqui encontraras informacion general,
            politicas y datos de contacto.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Productos para ninos y ninas de diferentes edades.</li>
            <li>
              Tienda ubicada en Calle Pagallos, Guiria, Estado Sucre, frente a
              los chinos Fabiola.
            </li>
            <li>Envios a todo el pais.</li>
            <li>Atencion personalizada por redes sociales y WhatsApp.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
