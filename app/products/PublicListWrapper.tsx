"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { Product } from "@/types/product.type";
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
    const size =
      variants.find((v) => (v.stock || 0) > 0)?.size || variants[0]?.size;
    if (!size) return;
    dispatch(
      addToCart({
        product: producto as any,
        quantity: 1,
        selectedSize: size,
      })
    );
  };

  const handleFavorite = (id: string) => {
    const producto = products.find((p) => p.id === id);
    if (!producto) return;
    dispatch(toggleFavorite(producto as any));
  };

  return (
    <ProductListPublic
      products={products}
      onAddToCart={handleAddToCart}
      onFavorite={handleFavorite}
    />
  );
}
