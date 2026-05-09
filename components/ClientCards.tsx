"use client";

import type { Product } from "@/types/domain/products";
import type { ProductSortBy } from "@/types/domain/products";
import Cards from "./Cards/Cards";

interface ClientCardsProps {
  initialProducts?: Product[];
  title?: string;
  description?: string;
  ctaLabel?: string;
  limit?: number;
  sortBy?: ProductSortBy;
}

export default function ClientCards({
  initialProducts = [],
  title,
  description,
  ctaLabel,
  limit,
  sortBy,
}: ClientCardsProps) {
  return (
    <Cards
      initialProducts={initialProducts}
      title={title}
      description={description}
      ctaLabel={ctaLabel}
      limit={limit}
      sortBy={sortBy}
    />
  );
}
