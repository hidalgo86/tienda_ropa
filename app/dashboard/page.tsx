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
import { redirect } from "next/navigation";

// Component
import Menu from "./components/Menu/Menu";
import Navbar from "../components/Navbar";
import Products from "./components/Products/Products";
import Provider from "./components/Provider/Provider";
import Clients from "./components/Clients/Clients";
import Finance from "./components/Finance/Finance";
import FormProduct from "./components/Products/Form";

// Types
import { ProductServer } from "@/types/product.type";

// Services
import { getProductoById } from "@/utils/getProductoById";

interface DashboardSearchParams {
  id?: string;
  page?: string;
  option?: string;
  form?: "create" | "edit";
}

// Component Dashboard
export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const option = params?.option || "Products";
  const page = Number(params?.page) || 1;
  const form = params?.form;

  // Product with empty values
  let product: ProductServer | null = null;

  if (option === "Salir") {
    redirect("/");
  }

  if (params.id && form === "edit") {
   product = await getProductoById(params.id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full">
        <aside className="w-full max-w-xs min-w-[220px] p-4 bg-gray-50 border-r border-gray-200 hidden md:block">
          <Menu option={option} />
        </aside>
        <main className="flex-1 p-4">
          {option === "products" && form && (
            <>
              <FormProduct
                mode={form}
                {...(form === "edit" && product ? { product } : {})}
              />
            </>
          )}
          {option === "products" && !form && (
            <>
              <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Productos</h1>
              <Products page={page} />
            </>
          )}
          {option === "clients" && (
            <>
              <h1 className="text-2xl font-bold mb-6 p-2">Clientes</h1>
              <Clients clientes={[]} />
            </>
          )}
          {option === "providers" && (
            <>
              <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Proveedores</h1>
              <Provider proveedores={[]} />
            </>
          )}
          {option === "finance" && (
            <>
              <h1 className="text-2xl font-bold mt-10 mb-6 p-2">Finanzas</h1>
              <Finance ventas={[]} compras={[]} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
