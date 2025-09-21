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

  return (
    <nav className="flex justify-center my-8">
      <ul className="inline-flex items-center gap-2">
        <li>
          <Link
            href={getPageLink(Math.max(1, currentPage - 1))}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-gray-200"
            }`}
            aria-disabled={currentPage === 1}
          >
            Anterior
          </Link>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li key={page}>
            <Link
              href={getPageLink(page)}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={getPageLink(Math.min(totalPages, currentPage + 1))}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-gray-200"
            }`}
            aria-disabled={currentPage === totalPages}
          >
            Siguiente
          </Link>
        </li>
      </ul>
    </nav>
  );
}
