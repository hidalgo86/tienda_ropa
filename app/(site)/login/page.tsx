"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { getStoredAuthToken, loginUser, storeAuthSession } from "@/services/users";
import type { LoginFormState } from "@/types/ui/users";

const initialFormState: LoginFormState = {
  username: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (getStoredAuthToken()) {
      router.replace("/account");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password) {
      setError("Usuario y contrasena requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginUser({
        username: form.username.trim(),
        password: form.password,
      });

      storeAuthSession(session);
      toast.success("Sesion iniciada");

      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/";
      router.push(redirectTo);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo iniciar sesion. Intenta nuevamente.";
      setError(message);
      toast.error(message, {
        description: "Verifica tus datos o vuelve a intentarlo en unos minutos.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          x
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Usuario</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.username}
              onChange={(e) =>
                setForm((current) => ({ ...current, username: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contrasena</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border rounded px-3 py-2 pr-12"
                value={form.password}
                onChange={(e) =>
                  setForm((current) => ({ ...current, password: e.target.value }))
                }
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="flex flex-col items-start mt-2 space-y-1">
            <button
              className="text-blue-600 text-sm hover:underline"
              type="button"
              onClick={() => router.push("/forgot-password")}
            >
              Olvide mi contrasena
            </button>
            <button
              className="text-blue-600 text-sm hover:underline"
              type="button"
              onClick={() => router.push("/forgot-username")}
            >
              Olvide mi usuario
            </button>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              onClick={() => router.push("/register")}
              disabled={isSubmitting}
            >
              Registrarse
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Iniciar sesion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
