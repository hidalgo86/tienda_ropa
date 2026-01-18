"use client";

import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { RootState } from "@/store";
import { toggleFavorite, clearFavorites } from "@/store/slices/favoriteSlice";
import { addToCart } from "@/store/slices/cartSlice";
import Navbar from "../../components/Navbar";
import ProductListPublic from "@/components/products/ProductListPublic";
import { ProductServer, Product } from "@/types/product.type";
import { MdDeleteSweep } from "react-icons/md";

export default function FavoritesClient() {
  const dispatch = useDispatch();
  const favoriteItems = useSelector(
    (state: RootState) => state.favorites.items
  );

  const handleFavorite = (productId: string) => {
    const producto = favoriteItems.find((p) => p.id === productId);
    if (!producto) return;
    dispatch(toggleFavorite(producto));
  };

  const handleAddToCart = (productId: string) => {
    const producto = favoriteItems.find((p) => p.id === productId);
    if (!producto) return;
    const variants = producto.variants || [];
    const size =
      variants.find((v) => (v.stock || 0) > 0)?.size || variants[0]?.size;
    if (!size) return;
    dispatch(
      addToCart({
        product: producto as ProductServer,
        quantity: 1,
        selectedSize: String(size),
      })
    );
  };

  const handleClearAllFavorites = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todos los favoritos?")) {
      dispatch(clearFavorites());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                ❤️ Mis Favoritos
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {favoriteItems.length === 0
                  ? "Aún no tienes productos favoritos"
                  : `${favoriteItems.length} producto${
                      favoriteItems.length === 1 ? "" : "s"
                    } guardado${favoriteItems.length === 1 ? "" : "s"}`}
              </p>
            </div>

            {favoriteItems.length > 0 && (
              <button
                onClick={handleClearAllFavorites}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <MdDeleteSweep size={20} />
                Limpiar todos
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {favoriteItems.length === 0 ? (
          // Estado vacío
          <div className="text-center py-16 sm:py-20 lg:py-24">
            <div className="max-w-md mx-auto">
              <div className="text-6xl sm:text-7xl lg:text-8xl mb-6">💔</div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                No tienes favoritos aún
              </h2>
              <p className="text-gray-600 mb-8">
                Explora nuestros productos y marca los que más te gusten tocando
                el corazón ❤️
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Explorar productos
              </Link>
            </div>
          </div>
        ) : (
          // Lista de favoritos
          <div className="space-y-6">
            {/* Info adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    💾 Guardado en memoria local
                  </h3>
                  <p className="text-sm text-blue-700">
                    Tus favoritos se guardan en este dispositivo. Cuando inicies
                    sesión, podrás sincronizarlos con tu cuenta.
                  </p>
                </div>
              </div>
            </div>

            {/* Lista pública reutilizada para favoritos */}
            <ProductListPublic
              products={favoriteItems as unknown as Product[]}
              onAddToCart={handleAddToCart}
              onFavorite={handleFavorite}
            />
          </div>
        )}
      </div>
    </div>
  );
}
