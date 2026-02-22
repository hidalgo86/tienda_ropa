// src/types/product.type.ts

export enum ProductStatus {
  DISPONIBLE = "DISPONIBLE",
  AGOTADO = "AGOTADO",
  ELIMINADO = "ELIMINADO",
}

export enum Genre {
  NINA = "NINA",
  NINO = "NINO",
  UNISEX = "UNISEX",
}

export enum Size {
  RN = "RN",
  M3 = "M3",
  M6 = "M6",
  M9 = "M9",
  M12 = "M12",
  M18 = "M18",
  M24 = "M24",
  T2 = "T2",
  T3 = "T3",
  T4 = "T4",
  T5 = "T5",
  T6 = "T6",
  T7 = "T7",
  T8 = "T8",
  T9 = "T9",
  T10 = "T10",
  T12 = "T12",
}

export const sizeLabels: Record<string, string> = {
  RN: "RN",
  M3: "3M",
  M6: "6M",
  M9: "9M",
  M12: "12M",
  M18: "18M",
  M24: "24M",
  T2: "2T",
  T3: "3T",
  T4: "4T",
  T5: "5T",
  T6: "6T",
  T7: "7T",
  T8: "8T",
  T9: "9T",
  T10: "10T",
  T12: "12T",
};

export const formatSizeLabel = (size?: string | Size | null): string => {
  if (!size) return "";
  const normalized = String(size).trim().toUpperCase();
  return sizeLabels[normalized] || String(size);
};

export interface VariantProduct {
  size: Size;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  genre: Genre;
  description?: string;
  variants?: VariantProduct[];
  imageUrl?: string;
  imagePublicId?: string;
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Producto tal como se usa en el cliente/Redux
export interface ProductServer {
  id: string;
  name: string;
  description?: string;
  genre: Genre;
  imageUrl?: string;
  imagePublicId?: string;
  variants?: Array<{
    size: string | Size;
    stock: number;
    price: number;
  }>;
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProductFiltersModel {
  name?: string;
  genre?: Genre;
  size?: Size[];
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
}

export interface PaginationModel {
  page: number;
  limit: number;
}

export interface ProductsQueryModel {
  filters: ProductFiltersModel;
  pagination: PaginationModel;
}

export interface CreateProduct {
  id: string;
  name: string;
  genre: Genre;
  description?: string;
  variants?: VariantProduct[];
  imageUrl?: string;
  imagePublicId?: string;
}

export interface UploadProduct {
  id: string;
  name?: string;
  genre?: Genre;
  description?: string;
  variants?: VariantProduct[];
  imageUrl?: string;
  imagePublicId?: string;
  status?: ProductStatus;
}
