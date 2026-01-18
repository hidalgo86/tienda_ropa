"use client";

import dynamic from "next/dynamic";

// Importar Footer de forma dinámica sin SSR para evitar problemas con window
const Footer = dynamic(() => import("../../components/Footer"), {
  ssr: false,
  loading: () => (
    <footer className="bg-gray-100 mt-auto">
      <div className="text-center py-8">
        <div className="text-gray-600">Cargando...</div>
      </div>
    </footer>
  ),
});

export default function FooterWrapper() {
  return <Footer />;
}
