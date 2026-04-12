// src/types/product.type.ts

// Categorías legacy del frontend.
// El backend nuevo trabaja con categoryId, pero se conservan para la UI existente.
export enum ProductCategory {
  ROPA = "ROPA",
  JUGUETE = "JUGUETE",
  ACCESORIO = "ACCESORIO",
  ALIMENTACION = "ALIMENTACION",
}

export const allowedCategories = new Set<ProductCategory>(
  Object.values(ProductCategory),
);

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;
}

export interface ProductCategoryOption {
  value: string;
  label: string;
  categoryId: string;
  supportsGenre: boolean;
}

const legacyCategoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.ROPA]: "Ropa",
  [ProductCategory.JUGUETE]: "Juguetes",
  [ProductCategory.ACCESORIO]: "Accesorios",
  [ProductCategory.ALIMENTACION]: "Alimentación",
};

export const legacyProductCategoryOptions: ProductCategoryOption[] = [
  {
    value: "ropa",
    label: legacyCategoryLabels[ProductCategory.ROPA],
    categoryId: "",
    supportsGenre: true,
  },
  {
    value: "juguete",
    label: legacyCategoryLabels[ProductCategory.JUGUETE],
    categoryId: "",
    supportsGenre: false,
  },
  {
    value: "accesorio",
    label: legacyCategoryLabels[ProductCategory.ACCESORIO],
    categoryId: "",
    supportsGenre: false,
  },
  {
    value: "alimentacion",
    label: legacyCategoryLabels[ProductCategory.ALIMENTACION],
    categoryId: "",
    supportsGenre: false,
  },
];

const normalizeCategoryLookupValue = (value: string): string =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const buildProductCategoryOptions = (
  categories?: Category[],
): ProductCategoryOption[] => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return [];
  }

  return categories
    .filter(
      (category) =>
        Boolean(category?.id?.trim()) &&
        Boolean(category?.name?.trim()) &&
        Boolean(category?.slug?.trim()),
    )
    .map((category) => ({
      value: category.slug,
      label: category.name,
      categoryId: category.id,
      supportsGenre: normalizeCategoryLookupValue(category.slug) === "ropa",
    }));
};

const getCategoryOptionsPool = (
  options?: ProductCategoryOption[],
): ProductCategoryOption[] => {
  const dynamicOptions = Array.isArray(options) ? options : [];
  if (dynamicOptions.length > 0) {
    return dynamicOptions;
  }
  return legacyProductCategoryOptions;
};

const findCategoryOptionByNormalizedValue = (
  value: string,
  options?: ProductCategoryOption[],
): ProductCategoryOption | null => {
  const normalizedValue = normalizeCategoryLookupValue(String(value));
  return (
    getCategoryOptionsPool(options).find(
      (option) =>
        normalizeCategoryLookupValue(option.value) === normalizedValue ||
        normalizeCategoryLookupValue(option.label) === normalizedValue,
    ) || null
  );
};

export const getCategoryOptionByValue = (
  value?: string | null,
  options?: ProductCategoryOption[],
): ProductCategoryOption | null => {
  if (!value) return null;
  return findCategoryOptionByNormalizedValue(value, options);
};

export const getCategoryOptionById = (
  categoryId?: string | null,
  options?: ProductCategoryOption[],
): ProductCategoryOption | null => {
  if (!categoryId) return null;
  return (
    getCategoryOptionsPool(options).find(
      (option) => option.categoryId === categoryId,
    ) || null
  );
};

export const resolveCategoryOption = (
  value?: string | null,
  options?: ProductCategoryOption[],
): ProductCategoryOption | null => {
  if (!value) return null;
  return (
    getCategoryOptionById(value, options) ||
    findCategoryOptionByNormalizedValue(value, options)
  );
};

export const isClothingCategory = (
  value?: string | null,
  options?: ProductCategoryOption[],
): boolean => {
  return resolveCategoryOption(value, options)?.supportsGenre || false;
};

export const resolveCategoryIdFromCategory = (
  value?: string | null,
  options?: ProductCategoryOption[],
): string | undefined => {
  return resolveCategoryOption(value, options)?.categoryId;
};

export const parseProductCategory = (
  category?: string | ProductCategory | null,
): ProductCategory | null => {
  if (!category) return null;
  const normalized = String(category).trim().toUpperCase() as ProductCategory;
  return allowedCategories.has(normalized) ? normalized : null;
};

export enum ProductState {
  ACTIVO = "activo",
  ELIMINADO = "eliminado",
}

export const allowedStates = new Set<ProductState>(Object.values(ProductState));

export const parseProductState = (
  state?: string | ProductState | null,
): ProductState | null => {
  if (!state) return null;
  const normalized = String(state).trim().toLowerCase() as ProductState;
  return allowedStates.has(normalized) ? normalized : null;
};

export enum ProductAvailability {
  DISPONIBLE = "disponible",
  AGOTADO = "agotado",
}

export const allowedAvailabilities = new Set<ProductAvailability>(
  Object.values(ProductAvailability),
);

export const parseProductAvailability = (
  availability?: string | ProductAvailability | null,
): ProductAvailability | null => {
  if (!availability) return null;
  const normalized = String(availability)
    .trim()
    .toLowerCase() as ProductAvailability;
  return allowedAvailabilities.has(normalized) ? normalized : null;
};

// Alias de compatibilidad para la UI vieja.
export enum ProductStatus {
  DISPONIBLE = ProductAvailability.DISPONIBLE,
  AGOTADO = ProductAvailability.AGOTADO,
  ELIMINADO = ProductState.ELIMINADO,
}

export const allowedStatuses = new Set<ProductStatus>(
  Object.values(ProductStatus),
);

export const parseProductStatus = (
  status?: string | ProductStatus | ProductState | ProductAvailability | null,
): ProductStatus | null => {
  if (!status) return null;
  const normalized = String(status).trim().toLowerCase();
  if (normalized === ProductState.ELIMINADO) {
    return ProductStatus.ELIMINADO;
  }
  if (normalized === ProductAvailability.DISPONIBLE) {
    return ProductStatus.DISPONIBLE;
  }
  if (normalized === ProductAvailability.AGOTADO) {
    return ProductStatus.AGOTADO;
  }
  return null;
};

// Géneros para ropa según backend.
export enum Genre {
  NINA = "niña",
  NINO = "niño",
  UNISEX = "unisex",
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

// Tallas legacy. El backend ahora usa variants.name genérico.
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

export interface VariantProduct {
  name: string;
  stock: number;
  price: number;
  image?: string;
  size?: Size | string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ProductStats {
  views: number;
  favorites: number;
  cartAdds: number;
  purchases: number;
  searches: number;
}

export interface CloudinaryUploadSignature {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface Product {
  id: string;
  sku?: string;
  slug?: string;
  categoryId?: string;
  name: string;
  description?: string;
  brand?: string;
  thumbnail?: string;
  genre?: Genre;
  variants?: VariantProduct[];
  images?: ProductImage[];
  stock?: number;
  price?: number;
  state?: ProductState;
  availability?: ProductAvailability;
  stats?: ProductStats;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  category?: ProductCategory;
  status?: ProductStatus;
}

export type ProductServer = Product;

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export enum ProductSortBy {
  NEWEST = "newest",
  OLDEST = "oldest",
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  NAME_ASC = "name_asc",
  NAME_DESC = "name_desc",
  MOST_PURCHASED = "most_purchased",
  MOST_VIEWED = "most_viewed",
}

export interface ProductFiltersModel {
  name?: string;
  categoryId?: string;
  genre?: Genre;
  variantNames?: string[];
  minPrice?: number;
  maxPrice?: number;
  state?: ProductState;
  availability?: ProductAvailability;
  category?: string;
  sizes?: Size[];
}

export interface PaginationModel {
  page: number;
  limit: number;
  sortBy?: ProductSortBy;
}

export interface ProductsQueryModel {
  filters: ProductFiltersModel;
  pagination: PaginationModel;
}

export interface ProductSearchFilters {
  page?: number;
  limit?: number;
  sortBy?: ProductSortBy;
  name?: string;
  categoryId?: string;
  genre?: Genre;
  variantNames?: string[];
  minPrice?: number;
  maxPrice?: number;
  state?: ProductState;
  availability?: ProductAvailability;
  category?: string;
  sizes?: Size[];
}

export interface CreateProduct {
  categoryId: string;
  name: string;
  description?: string;
  brand?: string;
  thumbnail?: string;
  images?: ProductImage[];
  genre?: Genre;
  variants?: VariantProduct[];
  stock?: number;
  price?: number;
  category?: string;
}

export interface UploadProduct {
  id: string;
  categoryId?: string;
  name?: string;
  genre?: Genre;
  description?: string;
  brand?: string;
  thumbnail?: string;
  variants?: VariantProduct[];
  images?: ProductImage[];
  stock?: number;
  price?: number;
  state?: ProductState;
  availability?: ProductAvailability;
  category?: string;
  status?: ProductStatus;
}

export const ADMIN_PRODUCT_FILTER_ALL = "all";

export type AdminProductFilter =
  | ProductAvailability
  | ProductState.ELIMINADO
  | typeof ADMIN_PRODUCT_FILTER_ALL;

export const getVariantName = (
  variant?: string | Pick<VariantProduct, "name" | "size"> | null,
): string => {
  if (!variant) return "";
  if (typeof variant === "string") return variant;
  return variant.name || String(variant.size || "");
};

export const formatVariantLabel = (
  variant?: string | Pick<VariantProduct, "name" | "size"> | null,
): string => {
  const value = getVariantName(variant);
  return formatSizeLabel(value);
};

export const getProductStatus = (
  product?: Pick<Product, "state" | "availability" | "status"> | null,
): ProductStatus | null => {
  if (!product) return null;
  if (product.status) return parseProductStatus(product.status);
  if (product.state === ProductState.ELIMINADO) {
    return ProductStatus.ELIMINADO;
  }
  if (product.availability) {
    return parseProductStatus(product.availability);
  }
  return null;
};

export const parseAdminProductFilter = (
  value?: string | AdminProductFilter | null,
): AdminProductFilter | null => {
  if (!value) return null;
  if (value === ADMIN_PRODUCT_FILTER_ALL) {
    return ADMIN_PRODUCT_FILTER_ALL;
  }
  const parsedAvailability = parseProductAvailability(value);
  if (parsedAvailability) {
    return parsedAvailability;
  }

  return parseProductState(value) === ProductState.ELIMINADO
    ? ProductState.ELIMINADO
    : null;
};

export const getProductStatusLabel = (
  product?: Pick<Product, "state" | "availability" | "status"> | null,
): string => {
  return getProductStatus(product) || "";
};

export const getProductCategoryLabel = (
  product?: (Pick<Product, "categoryId"> & { category?: string | null }) | null,
  options?: ProductCategoryOption[],
): string => {
  if (!product) return "";
  const resolvedCategory =
    resolveCategoryOption(product.categoryId, options) ||
    resolveCategoryOption(product.category, options);

  return (
    resolvedCategory?.label ||
    (parseProductCategory(product.category)
      ? legacyCategoryLabels[
          parseProductCategory(product.category) as ProductCategory
        ]
      : "") ||
    product.category ||
    product.categoryId ||
    ""
  );
};

export const hasProductVariants = (
  product?: Pick<Product, "variants"> | null,
): boolean => {
  return Array.isArray(product?.variants) && product.variants.length > 0;
};

export const isVariantProduct = hasProductVariants;

export const getProductPrices = (
  product?: Pick<Product, "variants" | "price"> | null,
): number[] => {
  if (!product) return [];

  if (hasProductVariants(product)) {
    return (product.variants ?? [])
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price));
  }

  return [Number(product.price)].filter((price) => Number.isFinite(price));
};

export const getProductStock = (
  product?: Pick<Product, "variants" | "stock"> | null,
): number => {
  if (!product) return 0;

  if (hasProductVariants(product)) {
    return (product.variants ?? []).reduce(
      (total, variant) => total + Math.max(0, Number(variant.stock) || 0),
      0,
    );
  }

  return Math.max(0, Number(product.stock) || 0);
};

export const findVariantBySelection = (
  variants: VariantProduct[] | undefined,
  selection?: string,
): VariantProduct | undefined => {
  if (!Array.isArray(variants) || !selection) return undefined;
  return variants.find((variant) => getVariantName(variant) === selection);
};
