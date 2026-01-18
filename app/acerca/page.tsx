export const metadata = {
  title: "Acerca",
  description: "Información sobre la tienda",
};

import Navbar from "@/components/Navbar";

export default function AcercaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Acerca de Chikitoslandia</h1>
          <p className="text-gray-700 mb-2">
            Bienvenido a nuestra tienda. Aquí encontrarás información general,
            políticas y datos de contacto.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Productos para niños y niñas de diferentes edades.</li>
            <li>Envíos a todo el país.</li>
            <li>Atención personalizada por redes sociales y WhatsApp.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
