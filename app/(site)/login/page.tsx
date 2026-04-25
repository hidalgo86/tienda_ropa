"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import {
  getStoredAuthToken,
  loginUser,
  storeAuthSession,
} from "@/services/users";
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
        new URLSearchParams(window.location.search).get("redirect") || "/";
      router.push(redirectTo);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo iniciar sesion. Intenta nuevamente.";
      setError(message);
      toast.error(message, {
        description:
          "Verifica tus datos o vuelve a intentarlo en unos minutos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center justify-center sm:min-h-[calc(100vh-5rem)]">
        <div className="relative w-full rounded-2xl bg-white p-5 shadow-md sm:p-8">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute right-3 top-3 text-2xl font-bold text-gray-400 focus:outline-none hover:text-gray-700 sm:right-4 sm:top-4"
            onClick={() => router.push("/")}
          >
            x
          </button>
          <div className="mb-6 pr-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Iniciar sesion
            </h1>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Accede a tu cuenta para guardar favoritos y sincronizar tu carrito.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Usuario
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm sm:text-base"
                value={form.username}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    username: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium sm:text-base">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-12 text-sm sm:text-base"
                  value={form.password}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      password: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                  }
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
              <button
                className="text-blue-600 text-sm hover:underline"
                type="button"
                onClick={() => router.push("/register")}
              >
                ¿No estás registrado? Pincha aquí
              </button>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-white disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Iniciar sesion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
