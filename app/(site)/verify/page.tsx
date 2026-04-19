"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getStoredUser, verifyEmail } from "@/services/users";
import type { VerifyEmailFormState } from "@/types/ui/users";

const initialFormState: VerifyEmailFormState = {
  userId: "",
  code: "",
};

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedUserId = getStoredUser()?.id?.trim() || "";
  const initialUserId = storedUserId || searchParams.get("userId")?.trim() || "";
  const initialCode = searchParams.get("code")?.trim() || "";

  const [form, setForm] = useState<VerifyEmailFormState>({
    ...initialFormState,
    userId: initialUserId,
    code: initialCode,
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canResend = useMemo(() => form.userId.trim().length > 0, [form.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.userId.trim()) {
      setError("No pudimos identificar tu cuenta. Inicia sesion nuevamente.");
      return;
    }

    if (!form.code.trim()) {
      setError("Debes indicar el codigo de verificacion");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyEmail({
        userId: form.userId.trim(),
        code: form.code.trim(),
      });

      setSuccessMessage(response.message);
      toast.success(response.message);
      window.setTimeout(() => {
        router.push("/account");
      }, 1200);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo verificar el correo";
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
        <h1 className="text-2xl font-bold mb-6 text-center">Verificar correo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">
            Introduce el codigo que recibiste por correo. Tu cuenta se
            identificara automaticamente.
          </p>
          <div>
            <label className="block mb-1 font-medium">Codigo</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.code}
              onChange={(e) =>
                setForm((current) => ({ ...current, code: e.target.value }))
              }
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {successMessage && (
            <div className="text-green-600 text-sm">{successMessage}</div>
          )}
          {!canResend && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No encontramos tu sesion activa. Vuelve a iniciar sesion para
              verificar tu cuenta.
            </div>
          )}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => router.push("/account")}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verificando..." : "Verificar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageContent />
    </Suspense>
  );
}
