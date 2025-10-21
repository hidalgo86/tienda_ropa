"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MdSearch } from "react-icons/md";

// Eliminado filtro de categoría

interface FiltrosProps {
  onFilterApply?: () => void;
}

export default function Filtros({ onFilterApply }: FiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado local para cada filtro (sin categoría)
  const [genero, setGenero] = useState(searchParams?.get("genero") || "");
  const [precioMin, setPrecioMin] = useState(
    searchParams?.get("precioMin") || ""
  );
  const [precioMax, setPrecioMax] = useState(
    searchParams?.get("precioMax") || ""
  );
  const [talla, setTalla] = useState(searchParams?.get("talla") || "");
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [isSearching, setIsSearching] = useState(false);

  // Actualiza la URL con todos los filtros
  const updateURL = (paramsObj: Record<string, string>) => {
    console.log("🔍 Aplicando filtros:", paramsObj);
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ""
    );
    // Limpiar todos los filtros anteriores
    ["genero", "precioMin", "precioMax", "talla", "search", "page"].forEach(
      (key) => params.delete(key)
    );
    // Agregar los nuevos filtros
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim());
        console.log(`✅ Filtro ${key}: ${value.trim()}`);
      }
    });
    params.set("page", "1"); // Reiniciar paginación
    const newUrl = `${pathname}?${params.toString()}`;
    console.log("🔗 Nueva URL:", newUrl);
    router.push(newUrl);

    // Cerrar el modal si estamos en móvil
    onFilterApply?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ genero, precioMin, precioMax, talla, search });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Título del sidebar solo en desktop/tablet */}
      <div className="border-b border-gray-200 pb-3 hidden sm:block">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Filtros
        </h2>
        <p className="text-sm text-gray-600 mt-1">Refina tu búsqueda</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Búsqueda */}
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            🔍 Buscar producto
          </label>
          <div className="flex gap-2">
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (
                    search.trim() ||
                    genero ||
                    precioMin ||
                    precioMax ||
                    talla
                  ) {
                    updateURL({ genero, precioMin, precioMax, talla, search });
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                         text-sm placeholder-gray-400
                         transition-colors"
              placeholder="Buscar por nombre o descripción..."
            />
            <button
              type="button"
              className={`px-3 py-2 text-white rounded-lg 
                         transition-colors flex items-center justify-center
                         focus:outline-none focus:ring-2 focus:ring-pink-300
                         min-w-[44px] ${
                           isSearching
                             ? "bg-pink-400 cursor-wait"
                             : "bg-pink-500 hover:bg-pink-600"
                         }`}
              title="Buscar productos"
              disabled={isSearching}
              onClick={async (e) => {
                e.preventDefault();
                if (
                  !search.trim() &&
                  !genero &&
                  !precioMin &&
                  !precioMax &&
                  !talla
                ) {
                  alert("Por favor, ingresa algún criterio de búsqueda");
                  return;
                }

                setIsSearching(true);
                try {
                  updateURL({ genero, precioMin, precioMax, talla, search });
                  // Simular pequeño delay para feedback visual
                  setTimeout(() => setIsSearching(false), 800);
                } catch (error) {
                  setIsSearching(false);
                  console.error("Error al aplicar filtros:", error);
                }
              }}
            >
              {isSearching ? (
                <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MdSearch size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Género */}
        <div>
          <label
            htmlFor="genero"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            👶 Género
          </label>
          <select
            id="genero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                       text-sm bg-white
                       transition-colors"
          >
            <option value="">Todos los géneros</option>
            <option value="niño">Niño 👦</option>
            <option value="niña">Niña 👧</option>
            <option value="unisex">Unisex 👶</option>
          </select>
        </div>
        {/* Talla */}
        <div>
          <label
            htmlFor="talla"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            📏 Talla
          </label>
          <select
            id="talla"
            value={talla}
            onChange={(e) => {
              const newTalla = e.target.value;
              if (newTalla !== talla) {
                setTalla(newTalla);
                updateURL({
                  genero,
                  precioMin,
                  precioMax,
                  talla: newTalla,
                  search,
                });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 text-sm bg-white transition-colors"
          >
            <option value="">Todas las tallas</option>
            <option value="RN">RN (Recién nacido)</option>
            <option value="3M">3M</option>
            <option value="6M">6M</option>
            <option value="9M">9M</option>
            <option value="12M">12M</option>
            <option value="18M">18M</option>
            <option value="24M">24M</option>
            <option value="2T">2T</option>
            <option value="3T">3T</option>
            <option value="4T">4T</option>
            <option value="5T">5T</option>
            <option value="6T">6T</option>
            <option value="7T">7T</option>
            <option value="8T">8T</option>
            <option value="9T">9T</option>
            <option value="10T">10T</option>
            <option value="12T">12T</option>
          </select>
        </div>

        {/* Rango de precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            💰 Rango de precio
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="precioMin"
                className="block text-xs text-gray-600 mb-1"
              >
                Mínimo
              </label>
              <input
                id="precioMin"
                type="number"
                min="0"
                step="0.01"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                           text-sm
                           transition-colors"
                placeholder="$0"
              />
            </div>
            <div>
              <label
                htmlFor="precioMax"
                className="block text-xs text-gray-600 mb-1"
              >
                Máximo
              </label>
              <input
                id="precioMax"
                type="number"
                min="0"
                step="0.01"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                           text-sm
                           transition-colors"
                placeholder="$999"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="w-full px-4 py-3 bg-pink-500 text-white rounded-lg 
                       hover:bg-pink-600 active:bg-pink-700
                       transition-colors font-medium text-sm
                       focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            ✨ Aplicar filtros
          </button>

          <button
            type="button"
            onClick={() => {
              setGenero("");
              setPrecioMin("");
              setPrecioMax("");
              setSearch("");
              updateURL({});
            }}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg 
                       hover:bg-gray-200 active:bg-gray-300
                       transition-colors text-sm
                       focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            🔄 Limpiar filtros
          </button>
        </div>
      </form>
    </div>
  );
}
