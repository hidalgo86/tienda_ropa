"use client";

import { useState } from "react";

export default function MigrationPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/migrate-products", {
        method: "POST",
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Error al conectar con la API" });
    } finally {
      setLoading(false);
    }
  };

  const executeActualMigration = () => {
    alert(
      "⚠️ Esta función ejecutaría la migración real. Por seguridad, está deshabilitada en este demo."
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔄 Migración de Productos</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Formato Actual vs Nuevo
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-red-600 mb-2">
                ❌ Formato Viejo:
              </h3>
              <pre className="bg-red-50 p-3 rounded text-sm">
                {`{
  "size": ["RN", "6M", "3M"],
  "price": 15,
  "stock": 4
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium text-green-600 mb-2">
                ✅ Formato Nuevo:
              </h3>
              <pre className="bg-green-50 p-3 rounded text-sm">
                {`{
  "variants": [
    {"size": "RN", "price": 15, "stock": 4},
    {"size": "6M", "price": 15, "stock": 4},
    {"size": "3M", "price": 15, "stock": 4}
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ejecutar Migración</h2>

          <div className="space-y-4">
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "🔍 Analizando..." : "🔍 1. Analizar Productos"}
            </button>

            {result && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">
                  📊 Resultado del Análisis:
                </h3>

                {result.error ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded">
                    <p className="text-red-600">❌ {result.error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                      <p>
                        <strong>Total productos:</strong> {result.total}
                      </p>
                      <p>
                        <strong>Para migrar:</strong> {result.toMigrate}
                      </p>
                      <p>
                        <strong>Para omitir:</strong> {result.toSkip}
                      </p>
                    </div>

                    {result.migrations && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Detalles por producto:</h4>
                        {result.migrations.map(
                          (migration: any, index: number) => (
                            <div key={index} className="border p-3 rounded">
                              <p>
                                <strong>ID:</strong> {migration.id}
                              </p>
                              {migration.name && (
                                <p>
                                  <strong>Nombre:</strong> {migration.name}
                                </p>
                              )}
                              <p>
                                <strong>Estado:</strong>
                                <span
                                  className={
                                    migration.status === "pending"
                                      ? "text-orange-600"
                                      : "text-gray-600"
                                  }
                                >
                                  {migration.status === "pending"
                                    ? " 🔄 Pendiente"
                                    : " ⏭️ Omitido"}
                                </span>
                              </p>
                              {migration.reason && (
                                <p>
                                  <strong>Razón:</strong> {migration.reason}
                                </p>
                              )}
                              {migration.newVariants && (
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-sm text-blue-600">
                                    Ver nuevos variants
                                  </summary>
                                  <pre className="text-xs bg-gray-50 p-2 mt-1 rounded">
                                    {JSON.stringify(
                                      migration.newVariants,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </details>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {result.toMigrate > 0 && (
                      <button
                        onClick={executeActualMigration}
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                      >
                        ✅ 2. Ejecutar Migración Real
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
