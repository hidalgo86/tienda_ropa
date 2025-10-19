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
    <div
      className="relative w-full 
                    max-w-sm sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl 
                    mx-auto 
                    rounded-lg sm:rounded-xl lg:rounded-2xl 
                    overflow-hidden 
                    shadow-md sm:shadow-lg lg:shadow-xl"
    >
      {/* Imagen responsiva */}
      <div
        className="w-full 
                      h-[180px] sm:h-[280px] lg:h-[400px] xl:h-[480px] 
                      bg-pink-50 flex items-center justify-center relative"
      >
        <Image
          src={imagenes[actual].src}
          alt={imagenes[actual].alt}
          fill
          style={{ objectFit: "contain" }}
          className="rounded-lg sm:rounded-xl lg:rounded-2xl"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
        />
      </div>

      {/* Botones de navegación responsivos */}
      <button
        onClick={anterior}
        className="absolute top-1/2 
                   left-2 sm:left-4 lg:left-6 
                   -translate-y-1/2 
                   bg-pink-200 hover:bg-pink-300 active:bg-pink-400
                   text-gray-700 
                   rounded-full 
                   p-1.5 sm:p-2 lg:p-3
                   shadow-md hover:shadow-lg 
                   transition-all duration-200
                   text-sm sm:text-base lg:text-lg
                   z-10"
        aria-label="Imagen anterior"
      >
        &#8592;
      </button>

      <button
        onClick={siguiente}
        className="absolute top-1/2 
                   right-2 sm:right-4 lg:right-6 
                   -translate-y-1/2 
                   bg-pink-200 hover:bg-pink-300 active:bg-pink-400
                   text-gray-700 
                   rounded-full 
                   p-1.5 sm:p-2 lg:p-3
                   shadow-md hover:shadow-lg 
                   transition-all duration-200
                   text-sm sm:text-base lg:text-lg
                   z-10"
        aria-label="Siguiente imagen"
      >
        &#8594;
      </button>

      {/* Indicadores de navegación responsivos */}
      <div
        className="absolute 
                      bottom-2 sm:bottom-4 lg:bottom-6 
                      w-full flex justify-center 
                      gap-1.5 sm:gap-2 lg:gap-3"
      >
        {imagenes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActual(idx)}
            className={`
              w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 
              rounded-full transition-all duration-300
              ${
                idx === actual
                  ? "bg-pink-500 scale-110"
                  : "bg-pink-200 hover:bg-pink-300"
              }
            `}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
