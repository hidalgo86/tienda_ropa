// app/dashboard/page.tsx
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
import Link from "next/link";
import Image from "next/image";

// Component
import Navbar from "../components/Navbar";
import Products from "./components/Products/Products";
import Provider from "./components/Provider/Provider";
import Clients from "./components/Clients/Clients";
import Finance from "./components/Finance/Finance";
import FormProduct from "./components/Products/Form/Form";

// Types
import { ProductServer } from "@/types/product.type";

// Services
import { getProductoById } from "@/services/products.services";

interface DashboardSearchParams {
  id?: string;
  page?: string;
  option?: string;
  form?: "create" | "edit";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const option = params?.option || "products";
  const page = Number(params?.page) || 1;
  const form = params?.form;

  // Product with empty values
  let product: ProductServer | null = null;

  if (option === "exit") {
    redirect("/");
  }

  if (params.id && form === "edit") {
    product = await getProductoById(params.id);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 w-full">
        {/* Sidebar para desktop */}
        <aside
          className="w-full max-w-xs min-w-[220px] 
                          p-3 sm:p-4 lg:p-6 
                          bg-white border-r border-gray-200 
                          hidden md:block"
        >
          {/* Contenido del sidebar para desktop */}
          <div className="flex flex-col items-center justify-start w-full h-full gap-4 lg:gap-6 pt-4">
            {[
              {
                src: "/dashboard/productos.png",
                alt: "products",
                label: "Productos",
              },
              {
                src: "/dashboard/clientes.png",
                alt: "clients",
                label: "Clientes",
              },
              {
                src: "/dashboard/proveedores.png",
                alt: "providers",
                label: "Proveedores",
              },
              {
                src: "/dashboard/finanzas.png",
                alt: "finance",
                label: "Finanzas",
              },
              { src: "/dashboard/salir.png", alt: "exit", label: "Salir" },
            ].map((img, idx) => (
              <Link
                key={idx}
                href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
                className={`flex flex-col items-center w-full p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                  option === img.alt
                    ? "bg-blue-100 text-blue-600 font-semibold shadow-sm"
                    : "hover:bg-gray-100 text-gray-700 hover:shadow-sm"
                }`}
              >
                <div className="flex flex-col items-center">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={32}
                    height={32}
                    className="lg:w-10 lg:h-10 mb-1 lg:mb-2"
                  />
                  <span className="text-xs lg:text-sm text-center leading-tight">
                    {img.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Main content responsivo */}
        <main
          className="flex-1 
                        px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 
                        pb-20 md:pb-8 
                        overflow-x-auto bg-white 
                        min-h-full"
        >
          {/* Headers responsivos */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            {option === "products" && !form && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  📦 Gestión de Productos
                </h1>
                <div className="text-sm sm:text-base text-gray-600">
                  Página {page}
                </div>
              </div>
            )}

            {option === "clients" && (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                👥 Gestión de Clientes
              </h1>
            )}

            {option === "providers" && (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                🏢 Gestión de Proveedores
              </h1>
            )}

            {option === "finance" && (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                💰 Panel Financiero
              </h1>
            )}

            {form && (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {form === "create" ? "➕ Crear Producto" : "✏️ Editar Producto"}
              </h1>
            )}
          </div>

          {/* Contenido principal responsivo */}
          <div className="w-full">
            {option === "products" && form && (
              <div className="max-w-4xl mx-auto">
                <FormProduct
                  mode={form}
                  {...(form === "edit" && product ? { product } : {})}
                />
              </div>
            )}

            {option === "products" && !form && (
              <div className="w-full">
                <Products page={page} />
              </div>
            )}

            {option === "clients" && (
              <div className="w-full max-w-6xl mx-auto">
                <Clients clientes={[]} />
              </div>
            )}

            {option === "providers" && (
              <div className="w-full max-w-6xl mx-auto">
                <Provider proveedores={[]} />
              </div>
            )}

            {option === "finance" && (
              <div className="w-full max-w-6xl mx-auto">
                <Finance ventas={[]} compras={[]} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Menú móvil - solo visible en móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-5 gap-1 py-2 px-2 safe-area-inset-bottom">
          {[
            {
              src: "/dashboard/productos.png",
              alt: "products",
              label: "Productos",
            },
            {
              src: "/dashboard/clientes.png",
              alt: "clients",
              label: "Clientes",
            },
            {
              src: "/dashboard/proveedores.png",
              alt: "providers",
              label: "Proveedores",
            },
            {
              src: "/dashboard/finanzas.png",
              alt: "finance",
              label: "Finanzas",
            },
            { src: "/dashboard/salir.png", alt: "exit", label: "Salir" },
          ].map((img, idx) => (
            <Link
              key={idx}
              href={`/dashboard?option=${encodeURIComponent(img.alt)}`}
              className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                option === img.alt
                  ? "text-blue-600"
                  : "text-gray-600 active:text-gray-900 hover:text-gray-800"
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  option === img.alt
                    ? "bg-blue-100"
                    : "hover:bg-gray-100 active:bg-gray-200"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={20}
                  height={20}
                  className="flex-shrink-0"
                />
              </div>
              <span
                className={`text-xs mt-1 text-center truncate w-full leading-tight ${
                  option === img.alt ? "font-semibold" : "font-normal"
                }`}
              >
                {img.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
