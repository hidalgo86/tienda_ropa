"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountClient() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<{
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = () => {
      // Aquí puedes implementar tu lógica de autenticación
      // Por ahora simularé verificando localStorage o cookies

      // Ejemplo: verificar token en localStorage
      const token = localStorage.getItem("authToken");
      const user = localStorage.getItem("userData");

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          setUserInfo(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Redireccionar a login si no está autenticado
    if (isAuthenticated === false) {
      // Incluir la URL actual como parámetro de redirect
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, router]);

  // Mostrar loading mientras verificamos autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya se redirige)
  if (!isAuthenticated) {
    return null;
  }

  // Contenido de la página de cuenta para usuarios autenticados
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gestiona tu información personal y preferencias
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar de navegación */}
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Navegación
                </h3>
              </div>
              <nav className="px-6 py-4 space-y-2">
                <a
                  href="#profile"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-pink-600 bg-pink-50"
                >
                  Información Personal
                </a>
                <a
                  href="#orders"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                >
                  Mis Pedidos
                </a>
                <a
                  href="#favorites"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                >
                  Favoritos
                </a>
                <a
                  href="#addresses"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                >
                  Direcciones
                </a>
                <button
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userData");
                    router.push("/login");
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Personal
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-6">
                  {/* Información del usuario */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {userInfo?.name || "Usuario"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {userInfo?.email || "usuario@ejemplo.com"}
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">0</div>
                      <div className="text-sm text-gray-600">
                        Pedidos realizados
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">
                        Productos favoritos
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        $0
                      </div>
                      <div className="text-sm text-gray-600">Total gastado</div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700">
                      Editar Perfil
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de pedidos recientes */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Pedidos Recientes
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <h4 className="mt-4 text-lg font-medium">
                    No tienes pedidos aún
                  </h4>
                  <p className="mt-2 text-sm">
                    Explora nuestros productos y realiza tu primera compra.
                  </p>
                  <button
                    onClick={() => router.push("/products")}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                  >
                    Explorar productos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
