interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
}

interface ProveedoresProps {
  proveedores: Proveedor[];
}

export default function Provider({ proveedores }: ProveedoresProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Contacto</th>
            <th className="px-4 py-2 border-b">Teléfono</th>
            <th className="px-4 py-2 border-b">Correo</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => (
            <tr key={proveedor.id} className="text-center">
              <td className="px-4 py-2 border-b">{proveedor.id}</td>
              <td className="px-4 py-2 border-b">{proveedor.nombre}</td>
              <td className="px-4 py-2 border-b">{proveedor.contacto}</td>
              <td className="px-4 py-2 border-b">{proveedor.telefono}</td>
              <td className="px-4 py-2 border-b">{proveedor.correo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}