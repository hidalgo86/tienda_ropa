"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { Product, getVariantName } from "@/types/domain/products";
import ProductListPublic from "@/components/products/ProductListPublic";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/favoriteSlice";

export default function PublicListWrapper({
  products,
}: {
  products: Product[];
}) {
  const dispatch = useDispatch();

  const handleAddToCart = (id: string) => {
    const producto = products.find((p) => p.id === id);
    if (!producto) return;
    const variants = producto.variants || [];
    const selectedVariant =
      variants.find((v) => (v.stock || 0) > 0) || variants[0];
    const variantName = getVariantName(selectedVariant);
    dispatch(
      addToCart({
        product: producto,
        quantity: 1,
        selectedSize: variantName || undefined,
      }),
    );
  };

  const handleFavorite = (id: string) => {
    const producto = products.find((p) => p.id === id);
    if (!producto) return;
    dispatch(toggleFavorite(producto));
  };

  return (
    <ProductListPublic
      products={products}
      onAddToCart={handleAddToCart}
      onFavorite={handleFavorite}
    />
  );
}
