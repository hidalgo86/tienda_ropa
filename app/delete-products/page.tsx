"use client";

import { useState } from "react";
import {
  getAdminProducts,
  hardDeleteProduct,
  softDeleteProduct,
} from "@/services/products.services";

interface Product {
  id: string;
  name: string;
  description: string;
  status: string;
  variants: unknown;
  size?: string[];
}

export default function DeleteProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");
  const [deleted, setDeleted] = useState<string[]>([]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAdminProducts(1, 100);
      setProducts(data.items);
    } catch (error) {
      console.error("Error cargando productos:", error);
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    const deleteTypeName =
      deleteType === "hard" ? "permanentemente" : "lógicamente (soft delete)";
    if (
      !confirm(`¿Estás seguro de eliminar ${deleteTypeName} "${productName}"?`)
    ) {
      return;
    }

    setDeleting((prev) => [...prev, productId]);
    try {
      if (deleteType === "hard") {
        await hardDeleteProduct(productId);
      } else {
        await softDeleteProduct(productId);
      }

      setDeleted((prev) => [...prev, productId]);

      // Si es soft delete, recargar para mostrar el cambio de estado
      if (deleteType === "soft") {
        await loadProducts();
      } else {
        // Si es hard delete, quitar de la lista
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }

      console.log(`✅ Producto "${productName}" eliminado (${deleteType})`);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert(`Error al eliminar "${productName}"`);
    } finally {
      setDeleting((prev) => prev.filter((id) => id !== productId));
    }
  };

  const deleteAllOldFormat = async () => {
    const oldFormatProducts = products.filter(
      (p) =>
        (!p.variants || p.variants === null) && p.size && Array.isArray(p.size)
    );

    if (oldFormatProducts.length === 0) {
      alert("No hay productos en formato viejo para eliminar");
      return;
    }

    const productNames = oldFormatProducts.map((p) => p.name).join(", ");
    if (
      !confirm(
        `¿Eliminar permanentemente ${oldFormatProducts.length} productos en formato viejo?\n\n${productNames}`
      )
    ) {
      return;
    }

    for (const product of oldFormatProducts) {
      await deleteProduct(product.id, product.name);
      // Esperar un poco entre eliminaciones
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🗑️ Eliminar Productos</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={loadProducts}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "🔍 Cargando..." : "🔍 Cargar Productos"}
            </button>

            {products.length > 0 && (
              <button
                onClick={deleteAllOldFormat}
                disabled={deleting.length > 0}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                🧹 Eliminar Formato Viejo
              </button>
            )}
          </div>

          {deleted.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
              <p className="text-green-600">
                ✅ Eliminados: {deleted.length} productos
              </p>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                📦 Productos Encontrados ({products.length})
              </h2>
            </div>

            <div className="divide-y">
              {products.map((product) => {
                const isOldFormat =
                  (!product.variants || product.variants === null) &&
                  product.size &&
                  Array.isArray(product.size);
                const isDeleting = deleting.includes(product.id);

                return (
                  <div key={product.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {product.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              product.status === "DISPONIBLE"
                                ? "bg-green-100 text-green-800"
                                : product.status === "ELIMINADO"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.status}
                          </span>
                          {isOldFormat && (
                            <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                              🔄 Formato Viejo
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-2">
                          {product.description}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          ID: {product.id}
                        </p>

                        {isOldFormat ? (
                          <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                            <p className="text-sm font-medium text-orange-800 mb-1">
                              Formato Viejo:
                            </p>
                            <p className="text-sm text-orange-700">
                              Tallas: {product.size?.join(", ")}
                            </p>
                          </div>
                        ) : product.variants &&
                          Array.isArray(product.variants) ? (
                          <div className="bg-green-50 border border-green-200 p-3 rounded">
                            <p className="text-sm font-medium text-green-800 mb-1">
                              Formato Nuevo:
                            </p>
                            <p className="text-sm text-green-700">
                              {product.variants.length} variants
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                            <p className="text-sm text-gray-600">
                              Sin variants definidos
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteProduct(product.id, product.name)}
                        disabled={isDeleting}
                        className="ml-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isDeleting ? <>🔄 Eliminando...</> : <>🗑️ Eliminar</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No hay productos cargados</p>
            <p className="text-gray-400 text-sm mt-2">
              Haz clic en "Cargar Productos" para ver la lista
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
