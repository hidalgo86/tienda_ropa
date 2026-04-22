"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  clearStoredSession,
  getStoredAuthToken,
  getStoredUser,
} from "@/services/users";
import { RootState } from "@/store";
import {
  MdFavorite,
  MdShoppingCart,
  MdLogin,
  MdLogout,
  MdStore,
  MdHome,
  MdPerson,
  MdBarChart,
  MdInfo,
  MdReceiptLong,
} from "react-icons/md";

const navLinks = [
  { href: "/", icon: <MdHome />, label: "Inicio" },
  { href: "/products", icon: <MdStore />, label: "Productos" },
  { href: "/dashboard/products", icon: <MdBarChart />, label: "Dashboard" },
];

const isAdminRole = (role?: string | null): boolean =>
  role?.trim().toLowerCase() === "administrador";

export default function Navbar() {
  const router = useRouter();
  const cartCount = useSelector((state: RootState) => state.cart.totalItems);
  const favoritesCount = useSelector((state: RootState) =>
    state.favorites && Array.isArray(state.favorites.items)
      ? state.favorites.items.length
      : 0,
  );
  const [mounted, setMounted] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const syncAuthState = () => {
      setMounted(true);
      setIsAuthenticated(Boolean(getStoredAuthToken()));
      setIsAdmin(isAdminRole(getStoredUser()?.role));
    };

    syncAuthState();
    window.addEventListener("auth:session-changed", syncAuthState);

    return () => {
      window.removeEventListener("auth:session-changed", syncAuthState);
    };
  }, []);

  const displayCart = mounted ? cartCount : 0;
  const displayFav = mounted ? favoritesCount : 0;
  const visibleNavLinks = navLinks.filter(
    (link) => link.href !== "/dashboard/products" || isAdmin,
  );
  const accountNavLinks = isAuthenticated
    ? [
        {
          href: "/account",
          icon: <MdPerson />,
          label: "Mi Cuenta",
        },
        {
          href: "/orders",
          icon: <MdReceiptLong />,
          label: "Pedidos",
        },
        {
          href: "/acerca",
          icon: <MdInfo />,
          label: "Acerca",
        },
      ]
    : [];

  const handleLogout = () => {
    clearStoredSession();
    router.push("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-pink-200 bg-pink-50/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-pink-50/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:h-20 sm:px-5 lg:h-24 lg:px-8">
          <Link href="/" className="flex min-w-0 flex-1 items-center">
            <Image
              src="/chikitoslandia.png"
              alt="Logo"
              width={900}
              height={260}
              priority
              unoptimized
              className="h-12 w-auto max-w-[180px] object-contain object-left sm:h-14 sm:max-w-[220px] md:max-w-[260px] lg:h-16 lg:max-w-[320px] xl:max-w-[360px]"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-8">
            {[...visibleNavLinks, ...accountNavLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-pink-500 xl:text-base"
              >
                <span className="text-lg xl:text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex xl:gap-4">
            <Link href="/favorites" title="Favoritos" className="relative group">
              <MdFavorite
                size={26}
                className="text-pink-400 transition-colors hover:text-pink-600 xl:h-7 xl:w-7"
              />
              {displayFav > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white xl:h-6 xl:min-w-[24px]">
                  {displayFav}
                </span>
              )}
            </Link>

            <Link href="/cart" title="Carrito" className="relative group">
              <MdShoppingCart
                size={26}
                className="text-sky-400 transition-colors hover:text-sky-600 xl:h-7 xl:w-7"
              />
              {displayCart > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs text-white xl:h-6 xl:min-w-[24px]">
                  {displayCart}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                <MdLogout size={26} className="xl:h-7 xl:w-7" />
              </button>
            ) : (
              <Link href="/login" title="Login" className="group">
                <MdLogin
                  size={26}
                  className="text-gray-500 transition-colors hover:text-gray-700 xl:h-7 xl:w-7"
                />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="text-gray-500 transition-colors hover:text-gray-700"
              >
                <MdLogout size={24} />
              </button>
            ) : (
              <Link href="/login" title="Login" className="relative">
                <MdLogin
                  size={24}
                  className="text-gray-500 transition-colors hover:text-gray-700"
                />
              </Link>
            )}
            <Link href="/cart" title="Carrito" className="relative">
              <MdShoppingCart
                size={24}
                className="text-sky-400 transition-colors hover:text-sky-600"
              />
              {displayCart > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[18px] items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs text-white">
                  {displayCart}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-pink-200 bg-white shadow-lg lg:hidden">
        <div className="flex justify-around items-center py-2 px-2">
          <Link
            href="/"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdHome size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Inicio
            </span>
          </Link>

          <Link
            href="/products"
            className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
          >
            <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
              <MdStore size={20} />
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Productos
            </span>
          </Link>

          <Link
            href="/favorites"
            className="relative flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 text-gray-600 transition-colors hover:text-pink-500"
          >
            <div className="relative rounded-full p-2 transition-colors hover:bg-pink-100">
              <MdFavorite size={20} />
              {displayFav > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {displayFav > 9 ? "9+" : displayFav}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Favoritos
            </span>
          </Link>

          <Link
            href="/cart"
            className="relative flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 text-gray-600 transition-colors hover:text-pink-500"
          >
            <div className="relative rounded-full p-2 transition-colors hover:bg-pink-100">
              <MdShoppingCart size={20} />
              {displayCart > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
                  {displayCart > 9 ? "9+" : displayCart}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 text-center truncate w-full font-normal">
              Carrito
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
              >
                <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                  <MdPerson size={20} />
                </div>
                <span className="text-xs mt-1 text-center truncate w-full font-normal">
                  Cuenta
                </span>
              </Link>

              <Link
                href="/orders"
                className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
              >
                <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                  <MdReceiptLong size={20} />
                </div>
                <span className="text-xs mt-1 text-center truncate w-full font-normal">
                  Pedidos
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
            >
              <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                <MdLogin size={20} />
              </div>
              <span className="text-xs mt-1 text-center truncate w-full font-normal">
                Ingresar
              </span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/dashboard/products"
              className="flex flex-col items-center py-2 px-1 rounded-lg transition-colors flex-1 min-w-0 text-gray-600 hover:text-pink-500"
            >
              <div className="p-2 rounded-full hover:bg-pink-100 transition-colors">
                <MdBarChart size={20} />
              </div>
              <span className="text-xs mt-1 text-center truncate w-full font-normal">
                Dashboard
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
