import { useProductos } from "./useProductos";
import { useState } from "react";
import FormProducto from "./FormProducto";

const Productos = () => {
  const { productos, loading, error, refetch } = useProductos();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: number) => {
    const seguro = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?"
    );
    if (!seguro) return;
    setDeleteId(id);
    setDeleteError(null);
    try {
      // Buscar el producto y su public_id
      const producto = productos.find((p) => p.id === id);
      if (producto && producto.imagePublicId) {
        await fetch("/api/delete-cloudinary-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: producto.imagePublicId }),
        });
      }
      await fetch("https://chikitoslandia.up.railway.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation DeleteProduct($id: String!) {
            deleteProduct(id: $id)
          }`,
          variables: { id: String(id) },
        }),
      });
      refetch && refetch();
    } catch (err) {
      setDeleteError("Error al eliminar producto");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="p-4">Cargando productos...</div>;
  }
  if (loading) {
    return <div className="p-4">Cargando productos...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (showForm) {
    return (
      <FormProducto
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          refetch && refetch();
        }}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center mb-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 flex items-center justify-center"
          title="Agregar nuevo producto"
          onClick={() => setShowForm(true)}
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
        </button>
      </div>
      {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr>
            {/* <th className="px-4 py-2 border-b">ID</th> */}
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Categoría</th>
            <th className="px-4 py-2 border-b">Precio</th>
            <th className="px-4 py-2 border-b">Stock</th>
            <th className="px-4 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {(productos || []).map((producto) => (
            <tr key={producto.id} className="text-center">
              {/* <td className="px-4 py-2 border-b">{producto.id}</td> */}
              <td className="px-4 py-2 border-b">{producto.name}</td>
              <td className="px-4 py-2 border-b">{producto.category}</td>
              <td className="px-4 py-2 border-b">{producto.price}</td>
              <td className="px-4 py-2 border-b">{producto.stock}</td>
              <td className="px-4 border-b gap-2 justify-center h-12 align-middle">
                <div className="flex gap-2 justify-center items-center h-full">
                  <button
                    className="bg-yellow-400 text-white px-2 py-1 rounded flex items-center justify-center"
                    onClick={() =>
                      alert("Funcionalidad de edición próximamente")
                    }
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
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded flex items-center justify-center"
                    onClick={() => handleDelete(producto.id)}
                    disabled={deleteId === producto.id}
                    title="Eliminar"
                  >
                    {deleteId === producto.id ? (
                      <span className="animate-pulse">...</span>
                    ) : (
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
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Productos;
