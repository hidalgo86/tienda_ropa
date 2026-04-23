import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatSizeLabel,
  getProductStock,
  getProductStatusLabel,
} from "@/types/domain/products";
import type { ProductCardPublicProps } from "@/types/ui/products";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MdFavorite, MdFavoriteBorder, MdShoppingCart } from "react-icons/md";

const PLACEHOLDER = "/placeholder.webp";

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "disponible":
      return "bg-emerald-50 text-emerald-700";
    case "agotado":
      return "bg-amber-50 text-amber-700";
    case "eliminado":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const resolveVariantSummary = (product: ProductCardPublicProps["product"]) => {
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return "Producto simple";
  }

  const labels = variants
    .slice(0, 3)
    .map((variant) => formatSizeLabel(variant.name || variant.size))
    .join(" - ");

  return variants.length > 3 ? `${labels} - ...` : labels;
};

const resolvePrice = (product: ProductCardPublicProps["product"]) => {
  const variants = product.variants ?? [];
  const minPrice =
    variants.length > 0
      ? Math.min(...variants.map((variant) => Number(variant.price) || 0))
      : null;
  const directPrice = Number(product.price ?? 0);

  if (minPrice !== null) {
    return `$${minPrice.toFixed(2)}`;
  }

  if (Number.isFinite(directPrice)) {
    return `$${directPrice.toFixed(2)}`;
  }

  return "Sin precio";
};

const ProductCardPublic: React.FC<ProductCardPublicProps> = ({
  product,
  onAddToCart,
  onFavorite,
}) => {
  const imageSrc = product.images?.[0]?.url || PLACEHOLDER;
  const status = getProductStatusLabel(product);
  const isDeleted = status === "eliminado";
  const isFavorite = useSelector((state: RootState) =>
    state.favorites?.items?.some((item) => item.id === product.id),
  );

  return (
    <article className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <Link
          href={`/products/${product.id}`}
          className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100"
          aria-label={`Ver detalle de ${product.name}`}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/products/${product.id}`}
              className="line-clamp-2 font-semibold text-slate-900 transition hover:text-pink-600"
            >
              {product.name}
            </Link>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadgeClass(status)}`}
            >
              {status}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {product.description?.trim() || "Sin descripcion"}
          </p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-slate-600">
        <div>
          <p>{resolveVariantSummary(product)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Existencia
            </p>
            <p className="mt-1">{getProductStock(product)}</p>
          </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Precio
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {resolvePrice(product)}
          </p>
        </div>
        </div>
      </div>

      {!isDeleted && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/products/${product.id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ver detalle
          </Link>

          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(product.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
              title="Agregar al carrito"
              aria-label="Agregar al carrito"
            >
              <MdShoppingCart size={16} />
              Agregar
            </button>
          )}

          {onFavorite && (
            <button
              type="button"
              onClick={() => onFavorite(product.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                isFavorite
                  ? "border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              aria-label={
                isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
              }
            >
              {isFavorite ? (
                <MdFavorite size={16} />
              ) : (
                <MdFavoriteBorder size={16} />
              )}
              Favorito
            </button>
          )}
        </div>
      )}
    </article>
  );
};

export default ProductCardPublic;
