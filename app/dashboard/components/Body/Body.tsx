import Clients from "../Clients/Clients";
import Finance from "../Finance/Finance";
import Products from "../Products/Products";
import Provider from "../Provider/Provider";

import {
  clientesMock,
  proveedoresMock,
  ventasMock,
  comprasMock,
} from "../mocks";

interface BodyProps {
  mostrar: "Clients" | "Providers" | "Products" | "Finance";
}

export default function Body({ mostrar }: BodyProps) {
  return (
    <div className="p-4">
      {mostrar === "Clients" && (
        <>
          <h1 className="text-2xl font-bold mb-6 p-2">Clientes</h1>
          <Clients clientes={clientesMock} />
        </>
      )}
      {mostrar === "Providers" && (
        <>
          <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Proveedores</h1>
          <Provider proveedores={proveedoresMock} />
        </>
      )}
      {mostrar === "Products" && (
        <>
          <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Productos</h1>
          <Products />
        </>
      )}
      {mostrar === "Finance" && (
        <>
          <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Finanzas</h1>
          <Finance ventas={ventasMock} compras={comprasMock} />
        </>
      )}
    </div>
  );
}
