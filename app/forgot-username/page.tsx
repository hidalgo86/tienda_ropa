"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("El email no es válido");
      return;
    }
    alert(
      "Si el correo está registrado, recibirás un email con tu usuario (simulado)"
    );
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md relative">
        {/* Botón de cierre (X) arriba a la derecha */}
        <button
          type="button"
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 border-none bg-transparent"
          style={{ borderRadius: 0, background: "none" }}
          onClick={() => router.push("/")}
        >
          <span className="text-2xl font-bold">×</span>
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center">
          Recuperar usuario
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Correo electrónico</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="mt-4 flex justify-around gap-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 w-32"
              onClick={() => router.push("/login")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-32"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
