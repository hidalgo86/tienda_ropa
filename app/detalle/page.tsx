"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DetallePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página de productos ya que hemos migrado a /products/[id]
    router.replace("/products");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirigiendo...
        </h2>
        <p className="text-gray-600">
          Esta página ha sido movida. Te estamos redirigiendo automáticamente.
        </p>
      </div>
    </div>
  );
}
