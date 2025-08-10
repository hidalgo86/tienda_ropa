interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: string;
  stock: number;
}

interface ProductosProps {
  productos: Producto[];
}

export default function Productos({ productos }: ProductosProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Categoría</th>
            <th className="px-4 py-2 border-b">Precio</th>
            <th className="px-4 py-2 border-b">Stock</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id} className="text-center">
              <td className="px-4 py-2 border-b">{producto.id}</td>
              <td className="px-4 py-2 border-b">{producto.nombre}</td>
              <td className="px-4 py-2 border-b">{producto.categoria}</td>
              <td className="px-4 py-2 border-b">{producto.precio}</td>
              <td className="px-4 py-2 border-b">{producto.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}