// app/dashboard/components/Products/Products.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import Pagination from "@/app/components/Pagination";
import {
  getProducts,
  getAdminProducts,
  softDeleteProduct,
  restoreProduct,
} from "@/services/products.services";
import { useEffect, useState } from "react";
import { ProductServer } from "@/types/product.type";

export default function Products({ page = 1 }: { page?: number }) {
  const [items, setItems] = useState<ProductServer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("DISPONIBLE");
  const [search, setSearch] = useState("");

  // 🔄 Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let response;
        if (statusFilter && statusFilter !== "ALL") {
          // Usa query admin para filtrar en backend por status
          response = await getAdminProducts(page, 20, statusFilter);
        } else {
          response = await getProducts(page, 20);
        }
        const { items, totalPages } = response;
        setItems(items);
        setTotalPages(totalPages);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [page, statusFilter]);

  // Filtrado por nombre en cliente (case-insensitive)
  const filteredItems = items.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🗑️ Soft delete
  async function handleSoftDelete(id: string) {
    try {
      if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

      await softDeleteProduct(id);
      alert("✅ Producto eliminado correctamente");

      // Refrescar lista tras eliminar
      const { items, totalPages } = await getProducts(page);
      setItems(items);
      setTotalPages(totalPages);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar producto");
    }
  }

  // ♻️ Restaurar producto eliminado
  async function handleRestore(product: ProductServer) {
    try {
      const targetStatus =
        product.stock && product.stock > 0 ? "disponible" : "agotado";
      await restoreProduct(product.id, targetStatus);
      alert(`✅ Producto habilitado como ${targetStatus}`);

      // Refrescar lista. Si estamos en ELIMINADO y ya no queda ninguno, cambiar a DISPONIBLE.
      if (statusFilter === "ELIMINADO") {
        const deletedResponse = await getAdminProducts(page, 20, statusFilter);
        if (deletedResponse.items.length === 0) {
          // Cambiar filtro automáticamente a disponibles
          setStatusFilter("DISPONIBLE");
          return; // el useEffect recargará la lista automáticamente
        } else {
          setItems(deletedResponse.items);
          setTotalPages(deletedResponse.totalPages);
          return;
        }
      }

      // Caso normal (no estábamos filtrando ELIMINADO)
      const refreshed = await getProducts(page, 20);
      setItems(refreshed.items);
      setTotalPages(refreshed.totalPages);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al restaurar producto");
    }
  }

  if (loading) return <p className="text-gray-500">Cargando productos...</p>;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex flex-col">
            <label
              htmlFor="status"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Estado
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="AGOTADO">AGOTADO</option>
              <option value="ELIMINADO">ELIMINADO</option>
            </select>
          </div>
          <div className="flex flex-col flex-1">
            <label
              htmlFor="search"
              className="text-sm font-medium text-gray-600 mb-1"
            >
              Buscar por nombre
            </label>
            <input
              id="search"
              type="text"
              placeholder="Ej: Body rosa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
        </div>
      </div>
      {/* Botón agregar */}
      <div className="flex justify-start mb-4">
        <Link
          href="/dashboard?option=products&form=create"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 flex items-center justify-center shadow-md"
          title="Agregar nuevo producto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14m7-7H5"
            />
          </svg>
        </Link>
      </div>

      {/* Grid de productos */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No hay productos que coincidan.
          </div>
        )}
        {filteredItems.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-col"
          >
            {/* Imagen + Acciones superpuestas */}
            <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={224}
                  height={224}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-gray-400 text-sm">Sin imagen</div>
              )}
              {/* Botones superpuestos */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Link
                  href={`/dashboard?option=products&form=edit&id=${product.id}`}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full flex items-center justify-center shadow transition"
                  title="Editar"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.475 5.408a2.357 2.357 0 1 1 3.336 3.336L7.5 21.055l-4.5 1.5 1.5-4.5 11.975-12.647Z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={() => handleSoftDelete(product.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center shadow transition"
                  title="Eliminar"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 6L6 18M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {/* Badge de status (arriba izquierda) */}
              {product.status && (
                <div
                  className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide shadow-sm uppercase border backdrop-blur
                  ${
                    product.status === "DISPONIBLE"
                      ? "bg-green-50 text-green-700 border-green-300"
                      : ""
                  }
                  ${
                    product.status === "AGOTADO"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                      : ""
                  }
                  ${
                    product.status === "ELIMINADO"
                      ? "bg-red-50 text-red-700 border-red-300"
                      : ""
                  }`}
                >
                  {product.status}
                </div>
              )}

              {/* Botón habilitar (abajo derecha) si eliminado */}
              {product.status === "ELIMINADO" && (
                <button
                  onClick={() => handleRestore(product)}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-blue-600/90 hover:bg-blue-700 text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                  aria-label="Habilitar producto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 6.74 5.15L1 10m22 4-5.74 4.85A9 9 0 0 1 3.51 15" />
                  </svg>
                  Habilitar
                </button>
              )}
            </div>

            {/* Info */}
            <div className="mt-3 flex flex-col flex-grow">
              <h3 className="font-semibold text-lg truncate">{product.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {product.genre}
              </p>

              <div className="mt-2 flex justify-between items-center">
                <span className="font-bold text-green-600">
                  ${product.price}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>
            </div>

            {/* Se eliminó el botón inferior de habilitar (ahora está dentro de la imagen) */}
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-center">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/dashboard?option=products"
        />
      </div>
    </div>
  );
}
