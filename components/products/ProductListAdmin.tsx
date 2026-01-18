import React from "react";
import { Product } from "@/types/product.type";
import ProductCardAdmin from "./productCardAdmin";

interface ProductListAdminProps {
  products: Product[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
}

const ProductListAdmin: React.FC<ProductListAdminProps> = ({
  products,
  onEdit,
  onDelete,
  onRestore,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No hay productos para mostrar.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCardAdmin
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
};

export default ProductListAdmin;
