"use client";

import { useState } from "react";
import FiltrosModal from "../components/FiltrosModal";

export default function FiltrosMobileButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón solo visible en móvil */}
      <div className="lg:hidden w-full flex justify-start mt-2 mb-4 px-2 sticky top-[64px] z-30">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-pink-500 text-white font-medium shadow hover:bg-pink-600 transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Abrir filtros"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle cx="5" cy="6" r="1.5" fill="currentColor" />
            <rect
              x="3"
              y="5"
              width="14"
              height="2"
              rx="1"
              fill="currentColor"
            />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
            <rect
              x="3"
              y="11"
              width="14"
              height="2"
              rx="1"
              fill="currentColor"
            />
            <circle cx="9" cy="18" r="1.5" fill="currentColor" />
            <rect
              x="11"
              y="17"
              width="10"
              height="2"
              rx="1"
              fill="currentColor"
            />
          </svg>
          Filtros
        </button>
      </div>
      <FiltrosModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
