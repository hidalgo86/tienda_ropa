"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import {
  formatSizeLabel,
  Genre,
  isClothingCategory,
  legacyProductCategoryOptions,
  resolveCategoryOption,
  Size,
} from "@/types/product.type";
import { useCategories } from "@/services/categories/useCategories";

const FILTER_KEYS = [
  "search",
  "categoryId",
  "category",
  "genre",
  "size",
  "minPrice",
  "maxPrice",
  "page",
  "genero",
  "talla",
  "precioMin",
  "precioMax",
] as const;

const readParam = (searchParams: URLSearchParams | null, ...keys: string[]) => {
  for (const key of keys) {
    const value = searchParams?.get(key);
    if (value && value.trim()) return value;
  }
  return "";
};

interface FiltrosProps {
  onFilterApply?: () => void;
}

export default function Filtros({ onFilterApply }: FiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { options } = useCategories();
  const categoryOptions = options.length
    ? options
    : legacyProductCategoryOptions;

  const [search, setSearch] = useState(readParam(searchParams, "search"));
  const [categoryId, setCategoryId] = useState(
    readParam(searchParams, "categoryId", "category"),
  );
  const [genre, setGenre] = useState(
    readParam(searchParams, "genre", "genero"),
  );
  const [size, setSize] = useState(readParam(searchParams, "size", "talla"));
  const [minPrice, setMinPrice] = useState(
    readParam(searchParams, "minPrice", "precioMin"),
  );
  const [maxPrice, setMaxPrice] = useState(
    readParam(searchParams, "maxPrice", "precioMax"),
  );
  const [isSearching, setIsSearching] = useState(false);
  const isClothingFilter =
    !categoryId || isClothingCategory(categoryId, categoryOptions);

  useEffect(() => {
    setSearch(readParam(searchParams, "search"));
    setCategoryId(readParam(searchParams, "categoryId", "category"));
    setGenre(readParam(searchParams, "genre", "genero"));
    setSize(readParam(searchParams, "size", "talla"));
    setMinPrice(readParam(searchParams, "minPrice", "precioMin"));
    setMaxPrice(readParam(searchParams, "maxPrice", "precioMax"));
  }, [searchParams]);

  // Actualiza la URL con todos los filtros
  const updateURL = (paramsObj: Record<string, string>) => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : "",
    );

    FILTER_KEYS.forEach((key) => params.delete(key));

    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim());
      }
    });

    params.set("page", "1");
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);

    onFilterApply?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({
      search,
      categoryId,
      genre,
      size,
      minPrice,
      maxPrice,
    });
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
                    categoryId ||
                    genre ||
                    minPrice ||
                    maxPrice ||
                    size
                  ) {
                    updateURL({
                      search,
                      categoryId,
                      genre,
                      size,
                      minPrice,
                      maxPrice,
                    });
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                         text-sm placeholder-gray-400
                         transition-colors"
              placeholder="Buscar por nombre..."
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
                  !categoryId &&
                  !genre &&
                  !minPrice &&
                  !maxPrice &&
                  !size
                ) {
                  alert("Por favor, ingresa algún criterio de búsqueda");
                  return;
                }

                setIsSearching(true);
                try {
                  updateURL({
                    search,
                    categoryId,
                    genre,
                    size,
                    minPrice,
                    maxPrice,
                  });
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

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            🧩 Categoría
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => {
              const nextCategoryId = e.target.value;
              const nextOption = resolveCategoryOption(
                nextCategoryId,
                categoryOptions,
              );
              const nextGenre =
                nextCategoryId && !nextOption?.supportsGenre ? "" : genre;
              const nextSize =
                nextCategoryId && !nextOption?.supportsGenre ? "" : size;

              setCategoryId(nextCategoryId);
              setGenre(nextGenre);
              setSize(nextSize);

              updateURL({
                search,
                categoryId: nextCategoryId,
                genre: nextGenre,
                size: nextSize,
                minPrice,
                maxPrice,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                       text-sm bg-white
                       transition-colors"
          >
            <option value="">Todas las categorías</option>
            {categoryOptions.map((option) => (
              <option
                key={option.categoryId || option.value}
                value={option.categoryId || option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Género */}
        <div>
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            👶 Género
          </label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            disabled={!isClothingFilter}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                       text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400
                       transition-colors"
          >
            <option value="">Todos los géneros</option>
            <option value={Genre.NINO}>Niño 👦</option>
            <option value={Genre.NINA}>Niña 👧</option>
            <option value={Genre.UNISEX}>Unisex 👶</option>
          </select>
        </div>
        {/* Talla */}
        <div>
          <label
            htmlFor="size"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            📏 Talla
          </label>
          <select
            id="size"
            value={size}
            disabled={!isClothingFilter}
            onChange={(e) => {
              const nextSize = e.target.value;
              if (nextSize !== size) {
                setSize(nextSize);
                updateURL({
                  search,
                  categoryId,
                  genre,
                  size: nextSize,
                  minPrice,
                  maxPrice,
                });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            <option value="">Todas las tallas</option>
            {Object.values(Size).map((option) => (
              <option key={option} value={option}>
                {formatSizeLabel(option)}
              </option>
            ))}
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
                htmlFor="minPrice"
                className="block text-xs text-gray-600 mb-1"
              >
                Mínimo
              </label>
              <input
                id="minPrice"
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
                           text-sm
                           transition-colors"
                placeholder="$0"
              />
            </div>
            <div>
              <label
                htmlFor="maxPrice"
                className="block text-xs text-gray-600 mb-1"
              >
                Máximo
              </label>
              <input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
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
              setSearch("");
              setCategoryId("");
              setGenre("");
              setSize("");
              setMinPrice("");
              setMaxPrice("");
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
