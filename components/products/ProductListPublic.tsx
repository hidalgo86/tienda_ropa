import React from "react";
import { Product } from "@/types/product.type";
import ProductCardPublic from "./productCardPublic";

interface ProductListPublicProps {
  products: Product[];
  onAddToCart?: (id: string) => void;
  onFavorite?: (id: string) => void;
}

const ProductListPublic: React.FC<ProductListPublicProps> = ({
  products,
  onAddToCart,
  onFavorite,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No hay productos para mostrar.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCardPublic
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
};

export default ProductListPublic;
