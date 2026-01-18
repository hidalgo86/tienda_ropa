// src/types/product.type.ts

export enum ProductStatus {
  DISPONIBLE = "disponible",
  AGOTADO = "agotado",
  ELIMINADO = "eliminado",
}

export enum Genre {
  NINA = "niña",
  NINO = "niño",
  UNISEX = "unisex",
}

export enum Size {
  RN = "RN",
  M3 = "3M",
  M6 = "6M",
  M9 = "9M",
  M12 = "12M",
  M18 = "18M",
  M24 = "24M",
  T2 = "2T",
  T3 = "3T",
  T4 = "4T",
  T5 = "5T",
  T6 = "6T",
  T7 = "7T",
  T8 = "8T",
  T9 = "9T",
  T10 = "10T",
  T12 = "12T",
}

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
  genre?: string;
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
