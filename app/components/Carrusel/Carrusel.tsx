"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const imagenes = [
  { src: "/instapago.png", alt: "Instapago" },
  { src: "/PagoMovil.png", alt: "Instapago" },
  
 
];

export default function Carrusel() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActual((prev) => (prev + 1) % imagenes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const siguiente = () => {
    setActual((prev) => (prev + 1) % imagenes.length);
  };

  const anterior = () => {
    setActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

 return (
  <div className="flex justify-between items-center w-full px-4" >
    <button
      onClick={anterior}
      className="bg-blue-400 text-white px-3 py-2 rounded hover:bg-blue-500 transition"
    >
      &#8592;
    </button>
    <div className="flex flex-col items-center justify-center" style={{ width: 300, height: 300 }}>
      <Image
        src={imagenes[actual].src}
        alt={imagenes[actual].alt}
        width={300}
        height={300}
        style={{ objectFit: "contain" }}
      />
    </div>
    <button
      onClick={siguiente}
      className="bg-blue-400 text-white px-3 py-2 rounded hover:bg-blue-500 transition"
    >
      &#8594;
    </button>
  </div>
);
}