"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MdSearch } from "react-icons/md";

// Eliminado filtro de categoría

export default function Filtros() {
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
  const [search, setSearch] = useState(searchParams?.get("search") || "");

  // Actualiza la URL con todos los filtros
  const updateURL = (paramsObj: Record<string, string>) => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ""
    );
    // Limpiar todos los filtros
    ["genero", "precioMin", "precioMax", "search", "page"].forEach((key) =>
      params.delete(key)
    );
    // Agregar los nuevos filtros
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", "1"); // Reiniciar paginación
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ genero, precioMin, precioMax, search });
  };

  return (
    <form
      className="mb-4 flex flex-wrap gap-4 items-end"
      onSubmit={handleSubmit}
    >
      {/* Búsqueda con botón lupa */}
      <div>
        <label htmlFor="search" className="block font-medium mb-1">
          Buscar:
        </label>
        <div className="flex items-center gap-1">
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Nombre o descripción"
          />
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 flex items-center justify-center"
            title="Buscar"
            onClick={() => updateURL({ genero, precioMin, precioMax, search })}
          >
            <MdSearch size={20} />
          </button>
        </div>
      </div>
      {/* Género */}
      <div>
        <label htmlFor="genero" className="block font-medium mb-1">
          Género:
        </label>
        <select
          id="genero"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos</option>
          <option value="niño">Niño</option>
          <option value="niña">Niña</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>
      {/* Precio mínimo y máximo en la misma línea */}
      <div className="flex gap-2 items-end">
        <div>
          <label htmlFor="precioMin" className="block font-medium mb-1">
            Precio mínimo:
          </label>
          <input
            id="precioMin"
            type="number"
            min="0"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
        <div>
          <label htmlFor="precioMax" className="block font-medium mb-1">
            Precio máximo:
          </label>
          <input
            id="precioMax"
            type="number"
            min="0"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
        </div>
      </div>
      {/* Botón de aplicar */}
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
