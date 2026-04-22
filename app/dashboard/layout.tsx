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
      src: "/dashboard/salir.png",
      alt: "exit",
      label: "Salir",
      href: "/",
    },
  ];

  const activeOption = React.useMemo(() => {
    if (pathname.includes("/dashboard/clients")) return "clients";
    if (pathname.includes("/dashboard/orders")) return "orders";
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
      <div className="flex flex-1 w-full">
        <SidebarDesktop items={sidebarItems} activeOption={activeOption} />
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-20 md:pb-8 overflow-x-auto bg-white min-h-full">
          {children}
        </main>
      </div>
      <SidebarMobile items={sidebarItems} activeOption={activeOption} />
    </div>
  );
}
