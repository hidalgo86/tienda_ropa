"use client";

import React, { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarDesktop, {
  SidebarItem,
} from "../../components/products/SidebarDesktop";
import SidebarMobile from "../../components/products/SidebarMobile";
import { getStoredAuthToken, getStoredUser } from "@/services/users";

const isAdminRole = (role?: string | null): boolean =>
  role?.trim().toLowerCase() === "administrador";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = React.useState<boolean | null>(null);

  const sidebarItems: SidebarItem[] = [
    {
      src: "/dashboard/productos.png",
      alt: "products",
      label: "Productos",
      href: "/dashboard/products",
    },
    {
      src: "/dashboard/clientes.png",
      alt: "clients",
      label: "Clientes",
      href: "/dashboard/clients",
    },
    {
      src: "/dashboard/finanzas.png",
      alt: "orders",
      label: "Ordenes",
      href: "/dashboard/orders",
    },
    {
      src: "/dashboard/productos.png",
      alt: "banners",
      label: "Carrusel",
      href: "/dashboard/banners",
    },
    {
      src: "/dashboard/salir.png",
      alt: "exit",
      label: "Salir",
      href: "/",
    },
  ];

  const activeOption = React.useMemo(() => {
    if (pathname.includes("/dashboard/clients")) return "clients";
    if (pathname.includes("/dashboard/orders")) return "orders";
    if (pathname.includes("/dashboard/banners")) return "banners";
    return "products";
  }, [pathname]);

  React.useEffect(() => {
    const token = getStoredAuthToken();
    const user = getStoredUser();
    const isAdmin = Boolean(token) && isAdminRole(user?.role);

    if (!isAdmin) {
      router.replace("/");
      setIsAllowed(false);
      return;
    }

    setIsAllowed(true);
  }, [router]);

  if (isAllowed !== true) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 w-full min-w-0">
        <SidebarDesktop items={sidebarItems} activeOption={activeOption} />
        <main className="min-w-0 flex-1 bg-white px-3 py-4 pb-20 sm:px-6 sm:py-6 sm:pb-24 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </main>
      </div>
      <SidebarMobile items={sidebarItems} activeOption={activeOption} />
    </div>
  );
}
