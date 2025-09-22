export const generateMetadata = () => ({
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
});
import Menu from "./components/Menu/Menu";
import Navbar from "../components/Navbar";
import Productos from "./components/Productos/Productos";
import Proveedores from "./components/Proveedores/Proveedores";
import Clientes from "./components/Clientes/clientes";
import Finanzas from "./components/Finanzas/Finanzas";
import FormProducto from "./components/Productos/Formulario";
import { redirect } from "next/navigation";
import { getProductoById } from "@/utils/getProductoById";
import { log } from "console";

interface DashboardSearchParams {
  opcion?: string;
  page?: string;
  formulario?: "crear" | "editar";
  id?: string;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const opcion = params?.opcion || "Productos";
  const page = Number(params?.page) || 1;
  const mostrarFormulario = params?.formulario;
  let producto = null;

  if (opcion === "Salir") {
    redirect("/");
  }

  if (params.id && mostrarFormulario === "editar") {
    // Aquí puedes manejar la lógica para cargar el producto por ID
    producto = await getProductoById(params.id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full">
        <aside className="w-full max-w-xs min-w-[220px] p-4 bg-gray-50 border-r border-gray-200 hidden md:block">
          <Menu opcion={opcion} />
        </aside>
        <main className="flex-1 p-4">
          {opcion === "Productos" && mostrarFormulario && (
            <>
              <FormProducto
                modo={mostrarFormulario as "crear" | "editar"}
                {...(mostrarFormulario === "editar" && producto
                  ? { producto }
                  : {})}
              />
            </>
          )}
          {opcion === "Productos" && !mostrarFormulario && (
            <>
              <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Productos</h1>
              <Productos page={page} />
            </>
          )}
          {opcion === "Clientes" && (
            <>
              <h1 className="text-2xl font-bold mb-6 p-2">Clientes</h1>
              <Clientes clientes={[]} />
            </>
          )}
          {opcion === "Proveedores" && (
            <>
              <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Proveedores</h1>
              <Proveedores proveedores={[]} />
            </>
          )}
          {opcion === "Finanzas" && (
            <>
              <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Finanzas</h1>
              <Finanzas ventas={[]} compras={[]} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
