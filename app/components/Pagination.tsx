import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageLink = (page: number) => {
    const hasQuery = basePath.includes("?");
    const sep = hasQuery ? "&" : "?";
    return `${basePath}${sep}page=${page}`;
  };

  // Función para obtener páginas visibles según el tamaño de pantalla
  const getVisiblePages = () => {
    const maxVisible = 5; // Máximo de páginas visibles en desktop
    const maxVisibleMobile = 3; // Máximo en móvil

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex justify-center" aria-label="Navegación de páginas">
      <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 p-1">
        {/* Botón anterior */}
        <Link
          href={getPageLink(Math.max(1, currentPage - 1))}
          className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            currentPage === 1
              ? "pointer-events-none opacity-40 text-gray-400"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-disabled={currentPage === 1}
        >
          <span className="hidden sm:inline">← Anterior</span>
          <span className="sm:hidden">←</span>
        </Link>

        {/* Primera página si no está visible */}
        {visiblePages[0] > 1 && (
          <>
            <Link
              href={getPageLink(1)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              1
            </Link>
            {visiblePages[0] > 2 && (
              <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
            )}
          </>
        )}

        {/* Páginas visibles */}
        {visiblePages.map((page) => (
          <Link
            key={page}
            href={getPageLink(page)}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-pink-500 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ))}

        {/* Última página si no está visible */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-gray-400 text-xs sm:text-sm">...</span>
            )}
            <Link
              href={getPageLink(totalPages)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}

        {/* Botón siguiente */}
        <Link
          href={getPageLink(Math.min(totalPages, currentPage + 1))}
          className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? "pointer-events-none opacity-40 text-gray-400"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
          aria-disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">Siguiente →</span>
          <span className="sm:hidden">→</span>
        </Link>
      </div>

      {/* Información de página en móvil */}
      <div className="sm:hidden ml-3 flex items-center text-xs text-gray-600">
        <span className="bg-gray-100 px-2 py-1 rounded">
          {currentPage}/{totalPages}
        </span>
      </div>
    </nav>
  );
}
