import Clientes from "../Clientes/clientes";
import Finanzas from "../Finanzas/Finanzas";
import Productos from "../Productos/Productos";
import Proveedores from "../Proveedores/Proveedores";

import {
  clientesMock,
  proveedoresMock,
  ventasMock,
  comprasMock,
} from "../mocks";

interface BodyProps {
  mostrar: "Clientes" | "Proveedores" | "Productos" | "Finanzas";
}

export default function Body({ mostrar }: BodyProps) {
  return (
    <div className="p-4">
      {mostrar === "Clientes" && (
        <>
          <h1 className="text-2xl font-bold mb-6 p-2">Clientes</h1>
          <Clientes clientes={clientesMock} />
        </>
      )}
      {mostrar === "Proveedores" && (
        <>
          <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Proveedores</h1>
          <Proveedores proveedores={proveedoresMock} />
        </>
      )}
      {mostrar === "Productos" && (
        <>
          <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Productos</h1>
          <Productos />
        </>
      )}
      {mostrar === "Finanzas" && (
        <>
          <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Finanzas</h1>
          <Finanzas ventas={ventasMock} compras={comprasMock} />
        </>
      )}
    </div>
  );
}
