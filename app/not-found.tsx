import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">La página que buscas no existe.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
