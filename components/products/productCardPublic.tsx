import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatSizeLabel,
  getProductStatusLabel,
} from "@/types/domain/products";
import type { ProductCardPublicProps } from "@/types/ui/products";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MdFavorite, MdFavoriteBorder, MdShoppingCart } from "react-icons/md";

const PLACEHOLDER = "/placeholder.webp";

const resolveVariantSummary = (
  product: ProductCardPublicProps["product"],
): string | null => {
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return null;
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
  const variantSummary = resolveVariantSummary(product);
  const isFavorite = useSelector((state: RootState) =>
    state.favorites?.items?.some((item) => item.id === product.id),
  );

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100"
        aria-label={`Ver detalle de ${product.name}`}
      >
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover transition duration-200 hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">
        <div className="min-w-0">
          <Link
            href={`/products/${product.id}`}
            className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition hover:text-pink-600 sm:text-base"
          >
            {product.name}
          </Link>

          <p className="mt-1 line-clamp-1 text-[11px] text-slate-500 sm:text-xs">
            {product.description?.trim() || "Sin descripcion"}
          </p>
        </div>

        {variantSummary ? (
          <p className="line-clamp-1 text-xs text-slate-500">
            {variantSummary}
          </p>
        ) : null}

        <p className="mt-auto text-base font-bold text-slate-900 sm:text-lg">
          {resolvePrice(product)}
        </p>

        {!isDeleted && (
          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-2 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ver
            </Link>

            {onAddToCart && (
              <button
                type="button"
                onClick={() => onAddToCart(product.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50"
                title="Agregar al carrito"
                aria-label="Agregar al carrito"
              >
                <MdShoppingCart size={16} />
              </button>
            )}

            {onFavorite && (
              <button
                type="button"
                onClick={() => onFavorite(product.id)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
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
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCardPublic;
