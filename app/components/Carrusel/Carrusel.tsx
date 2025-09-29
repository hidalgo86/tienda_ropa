"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const imagenes = [
  { src: "/bebe2.png", alt: "Pago Movil" },
  { src: "/bebe3.png", alt: "Banner 2" },
  { src: "/bebe.png", alt: "Banner 3" },
];

export default function Carrusel() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActual((prev) => (prev + 1) % imagenes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const siguiente = () => setActual((prev) => (prev + 1) % imagenes.length);
  const anterior = () =>
    setActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-8 rounded-xl overflow-hidden shadow-lg">
      {/* Imagen */}
      <div className="w-full h-[200px] sm:h-[250px] md:h-[350px] bg-pink-50 flex items-center justify-center">
        <Image
          src={imagenes[actual].src}
          alt={imagenes[actual].alt}
          fill
          style={{ objectFit: "contain" }}
          className="rounded-xl"
          priority
        />
      </div>

      {/* Botones */}
      <button
        onClick={anterior}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-pink-200 hover:bg-pink-300 text-white rounded-full p-2 shadow-md transition"
      >
        &#8592;
      </button>
      <button
        onClick={siguiente}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-pink-200 hover:bg-pink-300 text-white rounded-full p-2 shadow-md transition"
      >
        &#8594;
      </button>

      {/* Puntos de navegación */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {imagenes.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full ${
              idx === actual ? "bg-pink-400" : "bg-pink-200"
            } transition`}
          />
        ))}
      </div>
    </div>
  );
}
