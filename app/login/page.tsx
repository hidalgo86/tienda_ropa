"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Aquí iría la lógica real de login
    if (!usuario || !password) {
      setError("Usuario y contraseña requeridos");
      return;
    }
    // Simulación de login exitoso
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md relative">
        <button
          type="button"
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={() => router.push("/")}
        >
          ×
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Usuario</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contraseña</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex flex-col items-start mt-2 space-y-1">
            <button
              className="text-blue-600 text-sm hover:underline"
              type="button"
              onClick={() => router.push("/forgot-password")}
            >
              Olvidé mi contraseña
            </button>
            <button
              className="text-blue-600 text-sm hover:underline"
              type="button"
              onClick={() => router.push("/forgot-username")}
            >
              Olvidé mi usuario
            </button>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              onClick={() => router.push("/register")}
            >
              Registrarse
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
