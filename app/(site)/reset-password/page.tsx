"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/services/users";
import type { ResetPasswordFormState } from "@/types/ui/users";

const initialFormState: ResetPasswordFormState = {
  username: "",
  token: "",
  newPassword: "",
  confirmPassword: "",
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<ResetPasswordFormState>({
    ...initialFormState,
    username: searchParams.get("username")?.trim() || "",
    token: searchParams.get("token")?.trim() || "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.username.trim() || !form.token.trim()) {
      setError("Debes indicar username y token");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        username: form.username.trim(),
        token: form.token.trim(),
        newPassword: form.newPassword,
      });

      setSuccessMessage(response.message);
      toast.success(response.message);
      setTimeout(() => router.push("/login"), 1200);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo restablecer la contrasena";
      setError(message);
      toast.error(message);
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
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 border-none bg-transparent"
          style={{ borderRadius: 0, background: "none" }}
          onClick={() => router.push("/")}
        >
          <span className="text-2xl font-bold">x</span>
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center">
          Restablecer contrasena
        </h1>
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
            <label className="block mb-1 font-medium">Token</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.token}
              onChange={(e) =>
                setForm((current) => ({ ...current, token: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Nueva contrasena</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={form.newPassword}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  newPassword: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Confirmar nueva contrasena
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  confirmPassword: e.target.value,
                }))
              }
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {successMessage && (
            <div className="text-green-600 text-sm">{successMessage}</div>
          )}
          <div className="mt-4 flex justify-around gap-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 w-32"
              onClick={() => router.push("/login")}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-32 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
