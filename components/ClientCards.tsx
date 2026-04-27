"use client";

import type { Product } from "@/types/domain/products";
import Cards from "./Cards/Cards";

interface ClientCardsProps {
  initialProducts?: Product[];
}

export default function ClientCards({ initialProducts = [] }: ClientCardsProps) {
  return <Cards initialProducts={initialProducts} />;
}
