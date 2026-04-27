"use client";

import React, { Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import SidebarDesktop, {
  SidebarItem,
} from "../../components/products/SidebarDesktop";
import SidebarMobile from "../../components/products/SidebarMobile";
import {
  clearStoredSession,
  getCurrentUser,
  getStoredAuthToken,
  getStoredUser,
} from "@/services/users";

const isAdminRole = (role?: string | null): boolean =>
  role?.trim().toLowerCase() === "administrador";

export default function DashboardLayoutClient({
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
  const hasShownSessionExpiredRef = React.useRef(false);
  const isRedirectingRef = React.useRef(false);

  const sidebarItems: SidebarItem[] = [
    {
      src: "/dashboard/productos.png",
      alt: "products",
      label: "Productos",
      href: "/dashboard/products",
    },
    {
      src: "/dashboard/productos.png",
      alt: "categories",
      label: "Categorias",
      href: "/dashboard/categories",
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
    if (pathname.includes("/dashboard/categories")) return "categories";
    if (pathname.includes("/dashboard/clients")) return "clients";
    if (pathname.includes("/dashboard/orders")) return "orders";
    if (pathname.includes("/dashboard/banners")) return "banners";
    return "products";
  }, [pathname]);

  React.useEffect(() => {
    let isMounted = true;

    const redirectToLogin = (showToast: boolean) => {
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;

      if (isMounted) {
        setIsAllowed(false);
      }

      clearStoredSession();

      if (showToast && !hasShownSessionExpiredRef.current) {
        toast.error("Tu sesion ha expirado. Vuelve a iniciar sesion.");
        hasShownSessionExpiredRef.current = true;
      }

      if (isMounted) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    const validateSession = async (showToastOnExpire: boolean) => {
      const token = getStoredAuthToken();
      const user = getStoredUser();
      const isAdmin = Boolean(token) && isAdminRole(user?.role);

      if (!isAdmin) {
        redirectToLogin(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) return;

        if (!isAdminRole(currentUser?.role)) {
          redirectToLogin(false);
          return;
        }

        hasShownSessionExpiredRef.current = false;
        setIsAllowed(true);
      } catch {
        redirectToLogin(showToastOnExpire);
      }
    };

    const handleSessionChanged = () => {
      void validateSession(false);
    };

    const handleFocus = () => {
      void validateSession(true);
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "authToken" ||
        event.key === "refreshToken" ||
        event.key === "userData"
      ) {
        void validateSession(false);
      }
    };

    void validateSession(false);
    window.addEventListener("auth:session-changed", handleSessionChanged);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:session-changed", handleSessionChanged);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [pathname, router]);

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
