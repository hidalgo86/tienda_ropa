// src/types/product.type.ts

// Categorías de producto
export enum ProductCategory {
  ROPA = "ROPA",
  JUGUETE = "JUGUETE",
  ACCESORIO = "ACCESORIO",
  ALIMENTACION = "ALIMENTACION",
}

export const allowedCategories = new Set<ProductCategory>(
  Object.values(ProductCategory),
);

export const parseProductCategory = (
  category?: string | ProductCategory | null,
): ProductCategory | null => {
  if (!category) return null;
  const normalized = String(category).trim().toUpperCase() as ProductCategory;
  return allowedCategories.has(normalized) ? normalized : null;
};

// Estados de producto
export enum ProductStatus {
  DISPONIBLE = "DISPONIBLE",
  AGOTADO = "AGOTADO",
  ELIMINADO = "ELIMINADO",
}

export const allowedStatuses = new Set<ProductStatus>(
  Object.values(ProductStatus),
);

export const parseProductStatus = (
  status?: string | ProductStatus | null,
): ProductStatus | null => {
  if (!status) return null;
  const normalized = String(status).trim().toUpperCase() as ProductStatus;
  return allowedStatuses.has(normalized) ? normalized : null;
};

// Géneros para ropa
export enum Genre {
  NINA = "NINA",
  NINO = "NINO",
  UNISEX = "UNISEX",
}

export const genreLabels: Record<Genre, string> = {
  [Genre.NINA]: "Niña",
  [Genre.NINO]: "Niño",
  [Genre.UNISEX]: "Unisex",
};

const normalizeGenreValue = (genre: string): string =>
  genre
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const genreAliases: Record<string, Genre> = Object.entries(genreLabels).reduce(
  (acc, [value, label]) => {
    const genre = value as Genre;
    acc[normalizeGenreValue(genre)] = genre;
    acc[normalizeGenreValue(label)] = genre;
    return acc;
  },
  {} as Record<string, Genre>,
);

export const parseGenre = (genre?: string | Genre | null): Genre | null => {
  if (!genre) return null;
  return genreAliases[normalizeGenreValue(String(genre))] || null;
};

export const formatGenreLabel = (genre?: string | Genre | null): string => {
  if (!genre) return "";
  const parsed = parseGenre(genre);
  return parsed ? genreLabels[parsed] : String(genre);
};

// Tallas para ropa
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

export const sizeLabels: Record<Size, string> = {
  [Size.RN]: "RN",
  [Size.M3]: "3M",
  [Size.M6]: "6M",
  [Size.M9]: "9M",
  [Size.M12]: "12M",
  [Size.M18]: "18M",
  [Size.M24]: "24M",
  [Size.T2]: "2T",
  [Size.T3]: "3T",
  [Size.T4]: "4T",
  [Size.T5]: "5T",
  [Size.T6]: "6T",
  [Size.T7]: "7T",
  [Size.T8]: "8T",
  [Size.T9]: "9T",
  [Size.T10]: "10T",
  [Size.T12]: "12T",
};

export const allowedSizes = new Set<Size>(Object.values(Size));

export const formatSizeLabel = (size?: string | Size | null): string => {
  if (!size) return "";
  const normalized = String(size).trim().toUpperCase();
  return sizeLabels[normalized as Size] || String(size);
};

// Interfaces de producto
export interface VariantProduct {
  size: Size;
  stock: number;
  price: number;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

// Producto principal
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  genre?: Genre;
  description?: string;
  variants?: VariantProduct[];
  images: ProductImage[];
  stock?: number;
  price?: number;
  status?: ProductStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Producto desde backend para cliente/Redux
export interface ProductServer extends Product {}

// Paginación
export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Filtros y queries
export interface ProductFiltersModel {
  name?: string;
  category?: ProductCategory; // <--- agregado
  genre?: Genre;
  sizes?: Size[]; // <--- renombrado para coincidir con DTO Nest
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

export interface ProductSearchFilters {
  page?: number;
  limit?: number;
  name?: string;
  category?: ProductCategory;
  genre?: Genre;
  sizes?: Size[];
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
}

// Crear producto (frontend → backend)
export interface CreateProduct {
  name: string;
  category: ProductCategory;
  description?: string;
  genre?: Genre; // solo ropa
  variants?: VariantProduct[]; // solo ropa
  images: ProductImage[]; // al menos 1
  stock?: number; // solo no ropa
  price?: number; // solo no ropa
}

// Para subir producto en Redux/cliente
export interface UploadProduct {
  id: string;
  name?: string;
  category?: ProductCategory;
  genre?: Genre;
  description?: string;
  variants?: VariantProduct[];
  images?: ProductImage[];
  stock?: number;
  price?: number;
  status?: ProductStatus;
}
