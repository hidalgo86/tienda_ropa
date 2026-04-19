"use client";

import { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { MdTune } from "react-icons/md";
import type { ProductFiltersModalProps } from "@/types/ui/products";
import Filtros from "./Filtros";

export default function FiltrosModal({
  isOpen,
  onClose,
}: ProductFiltersModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-pink-50">
          <div className="flex items-center gap-2">
            <MdTune size={22} className="text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          <p className="text-sm text-gray-600 ml-1">Refina tu búsqueda</p>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-pink-100 rounded-full transition-colors"
            aria-label="Cerrar filtros"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Filtros onFilterApply={onClose} />
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            💡 Aplica los filtros para ver resultados
          </p>
        </div>
      </div>
    </div>
  );
}
