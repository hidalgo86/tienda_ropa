"use client";

import { useEffect } from "react";
import { MdClose } from "react-icons/md";
import Filtros from "./Filtros";

interface FiltrosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FiltrosModal({ isOpen, onClose }: FiltrosModalProps) {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup cuando se desmonta el componente
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Slide from right */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-pink-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">🔍 Filtros</h2>
            <p className="text-sm text-gray-600">Refina tu búsqueda</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-pink-100 rounded-full transition-colors"
            aria-label="Cerrar filtros"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Filtros onFilterApply={onClose} />
        </div>

        {/* Footer con hint */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            💡 Aplica los filtros para ver resultados
          </p>
        </div>
      </div>
    </div>
  );
}
