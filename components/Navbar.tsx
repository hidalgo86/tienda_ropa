"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
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
        ...(!isAdmin
          ? [
              {
                href: "/orders",
                icon: <MdReceiptLong />,
                label: "Pedidos",
              },
            ]
          : []),
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

  const isActivePath = React.useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/";
      }

      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-pink-200 bg-pink-50/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-pink-50/90">
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-center overflow-hidden px-4 sm:h-20 sm:justify-between sm:px-5 lg:grid lg:h-28 lg:grid-cols-[minmax(300px,430px)_minmax(0,1fr)_auto] lg:gap-8 lg:px-8 xl:grid-cols-[minmax(360px,500px)_minmax(0,1fr)_auto] xl:gap-10">
          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center justify-start overflow-hidden pr-14 sm:pr-0 lg:flex-none"
          >
            <Image
              src="/chikitoslandia.png"
              alt="Logo"
              width={900}
              height={260}
              priority
              unoptimized
              className="h-36 w-auto max-w-[460px] object-cover object-left sm:h-14 sm:max-w-[220px] md:max-w-[260px] lg:h-32 lg:max-w-[430px] xl:h-36 xl:max-w-[500px]"
            />
          </Link>

          <div className="hidden min-w-0 items-center justify-center gap-2 overflow-hidden border-r border-pink-200 pr-6 lg:flex xl:gap-4 xl:pr-8">
            {[...visibleNavLinks, ...accountNavLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-pink-500 xl:gap-2"
              >
                <span className="shrink-0 text-lg xl:text-xl">{link.icon}</span>
                <span
                  className={`truncate ${
                    link.href === "/acerca" ? "hidden 2xl:inline" : ""
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center justify-end gap-4 lg:flex xl:gap-5">
            {!isAdmin && (
              <>
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
              </>
            )}

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

          {isAuthenticated && (
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="rounded-full bg-white/80 p-2 text-gray-500 shadow-sm transition-colors hover:text-gray-700"
              >
                <MdLogout size={24} />
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-pink-200 bg-white shadow-lg lg:hidden">
        <div className="flex justify-around items-center py-2 px-2">
          <Link
            href="/"
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
              isActivePath("/")
                ? "text-pink-600"
                : "text-gray-600 hover:text-pink-500"
            }`}
          >
            <div
              className={`rounded-full p-2 transition-colors ${
                isActivePath("/")
                  ? "bg-pink-100 text-pink-600"
                  : "hover:bg-pink-100"
              }`}
            >
              <MdHome size={20} />
            </div>
            <span
              className={`mt-1 w-full truncate text-center text-xs ${
                isActivePath("/") ? "font-semibold" : "font-normal"
              }`}
            >
              Inicio
            </span>
          </Link>

          <Link
            href="/products"
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
              isActivePath("/products")
                ? "text-pink-600"
                : "text-gray-600 hover:text-pink-500"
            }`}
          >
            <div
              className={`rounded-full p-2 transition-colors ${
                isActivePath("/products")
                  ? "bg-pink-100 text-pink-600"
                  : "hover:bg-pink-100"
              }`}
            >
              <MdStore size={20} />
            </div>
            <span
              className={`mt-1 w-full truncate text-center text-xs ${
                isActivePath("/products") ? "font-semibold" : "font-normal"
              }`}
            >
              Productos
            </span>
          </Link>

          {!isAdmin && (
            <>
              <Link
                href="/favorites"
                className={`relative flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
                  isActivePath("/favorites")
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <div
                  className={`relative rounded-full p-2 transition-colors ${
                    isActivePath("/favorites")
                      ? "bg-pink-100 text-pink-600"
                      : "hover:bg-pink-100"
                  }`}
                >
                  <MdFavorite size={20} />
                  {displayFav > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {displayFav > 9 ? "9+" : displayFav}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1 w-full truncate text-center text-xs ${
                    isActivePath("/favorites") ? "font-semibold" : "font-normal"
                  }`}
                >
                  Favoritos
                </span>
              </Link>

              <Link
                href="/cart"
                className={`relative flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
                  isActivePath("/cart")
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <div
                  className={`relative rounded-full p-2 transition-colors ${
                    isActivePath("/cart")
                      ? "bg-pink-100 text-pink-600"
                      : "hover:bg-pink-100"
                  }`}
                >
                  <MdShoppingCart size={20} />
                  {displayCart > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
                      {displayCart > 9 ? "9+" : displayCart}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1 w-full truncate text-center text-xs ${
                    isActivePath("/cart") ? "font-semibold" : "font-normal"
                  }`}
                >
                  Carrito
                </span>
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
                  isActivePath("/account")
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <div
                  className={`rounded-full p-2 transition-colors ${
                    isActivePath("/account")
                      ? "bg-pink-100 text-pink-600"
                      : "hover:bg-pink-100"
                  }`}
                >
                  <MdPerson size={20} />
                </div>
                <span
                  className={`mt-1 w-full truncate text-center text-xs ${
                    isActivePath("/account") ? "font-semibold" : "font-normal"
                  }`}
                >
                  Cuenta
                </span>
              </Link>

              {!isAdmin && (
                <Link
                  href="/orders"
                  className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
                    isActivePath("/orders")
                      ? "text-pink-600"
                      : "text-gray-600 hover:text-pink-500"
                  }`}
                >
                  <div
                    className={`rounded-full p-2 transition-colors ${
                      isActivePath("/orders")
                        ? "bg-pink-100 text-pink-600"
                        : "hover:bg-pink-100"
                    }`}
                  >
                    <MdReceiptLong size={20} />
                  </div>
                  <span
                    className={`mt-1 w-full truncate text-center text-xs ${
                      isActivePath("/orders") ? "font-semibold" : "font-normal"
                    }`}
                  >
                    Pedidos
                  </span>
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/login"
              className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
                isActivePath("/login")
                  ? "text-pink-600"
                  : "text-gray-600 hover:text-pink-500"
              }`}
            >
              <div
                className={`rounded-full p-2 transition-colors ${
                  isActivePath("/login")
                    ? "bg-pink-100 text-pink-600"
                    : "hover:bg-pink-100"
                }`}
              >
                <MdLogin size={20} />
              </div>
              <span
                className={`mt-1 w-full truncate text-center text-xs ${
                  isActivePath("/login") ? "font-semibold" : "font-normal"
                }`}
              >
                Ingresar
              </span>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/dashboard/products"
              className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-1 py-2 transition-colors ${
                isActivePath("/dashboard/products")
                  ? "text-pink-600"
                  : "text-gray-600 hover:text-pink-500"
              }`}
            >
              <div
                className={`rounded-full p-2 transition-colors ${
                  isActivePath("/dashboard/products")
                    ? "bg-pink-100 text-pink-600"
                    : "hover:bg-pink-100"
                }`}
              >
                <MdBarChart size={20} />
              </div>
              <span
                className={`mt-1 w-full truncate text-center text-xs ${
                  isActivePath("/dashboard/products")
                    ? "font-semibold"
                    : "font-normal"
                }`}
              >
                Dashboard
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
