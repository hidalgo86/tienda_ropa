import Pagination from "@/app/components/Pagination";
import { getProducts } from "@/utils/getProducts";
import Link from "next/link";

interface ProductosProps {
  page?: number;
}

export default async function Productos({ page = 1 }: ProductosProps) {
  const { items, totalPages } = await getProducts(page);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center mb-4">
        <Link
          href="/dashboard?opcion=Productos&formulario=crear"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 flex items-center justify-center"
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
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Categoría</th>
            <th className="px-4 py-2 border-b">Precio</th>
            <th className="px-4 py-2 border-b">Stock</th>
            <th className="px-4 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((producto) => (
            <tr key={producto.id} className="text-center">
              <td className="px-4 py-2 border-b">{producto.name}</td>
              <td className="px-4 py-2 border-b">{producto.genre}</td>
              <td className="px-4 py-2 border-b">{producto.price}</td>
              <td className="px-4 py-2 border-b">{producto.stock}</td>
              <td className="px-4 border-b gap-2 justify-center h-12 align-middle">
                <div className="flex gap-2 justify-center items-center h-full">
                  <Link
                    href={`/dashboard?opcion=Productos&formulario=editar&id=${producto.id}`}
                    className="bg-yellow-400 text-white px-2 py-1 rounded flex items-center justify-center"
                    title="Editar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
                  <Link
                    href={`/dashboard/productos/eliminar/${producto.id}`}
                    className="bg-red-500 text-white px-2 py-1 rounded flex items-center justify-center"
                    title="Eliminar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/dashboard?opcion=Productos"
        />
      </div>
    </div>
  );
}
