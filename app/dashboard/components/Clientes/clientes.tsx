interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
}

interface ClientesProps {
  clientes: Cliente[];
}

export default function Clientes({ clientes }: ClientesProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Correo</th>
            <th className="px-4 py-2 border-b">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="text-center">
              <td className="px-4 py-2 border-b">{cliente.id}</td>
              <td className="px-4 py-2 border-b">{cliente.nombre}</td>
              <td className="px-4 py-2 border-b">{cliente.correo}</td>
              <td className="px-4 py-2 border-b">{cliente.telefono}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
