import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SidebarDesktop, {
  SidebarItem,
} from "../../components/products/SidebarDesktop";
import SidebarMobile from "../../components/products/SidebarMobile";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sidebar items
  const sidebarItems: SidebarItem[] = [
    {
      src: "/dashboard/productos.png",
      alt: "products",
      label: "Productos",
      href: "/dashboard?option=products",
    },
    {
      src: "/dashboard/clientes.png",
      alt: "clients",
      label: "Clientes",
      href: "/dashboard?option=clients",
    },
    {
      src: "/dashboard/proveedores.png",
      alt: "providers",
      label: "Proveedores",
      href: "/dashboard?option=providers",
    },
    {
      src: "/dashboard/finanzas.png",
      alt: "finance",
      label: "Finanzas",
      href: "/dashboard?option=finance",
    },
    {
      src: "/dashboard/salir.png",
      alt: "exit",
      label: "Salir",
      href: "/",
    },
  ];

  // Detectar opción activa desde la URL (solo en cliente)
  let activeOption = "products";
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    activeOption = params.get("option") || "products";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 w-full">
        <SidebarDesktop items={sidebarItems} activeOption={activeOption} />
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-20 md:pb-8 overflow-x-auto bg-white min-h-full">
          {children}
        </main>
      </div>
      <SidebarMobile items={sidebarItems} activeOption={activeOption} />
      <Footer />
    </div>
  );
}
