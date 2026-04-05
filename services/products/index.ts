import type {
  CreateProduct,
  PaginatedProducts,
  Product,
  ProductSearchFilters,
  UploadProduct,
} from "@/types/product.type";

interface ApiOptions {
  baseUrl?: string;
  cache?: RequestCache;
  signal?: AbortSignal;
}

const buildApiUrl = (path: string, baseUrl?: string): string => {
  if (!baseUrl) return path;
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
};

const parseResponseOrThrow = async <T>(
  response: Response,
  fallbackErrorMessage: string,
): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) || fallbackErrorMessage;
    throw new Error(String(message));
  }

  return data as T;
};

export const listProducts = async (
  params: ProductSearchFilters = {},
  options: ApiOptions = {},
): Promise<PaginatedProducts> => {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));

  if (params.name?.trim()) query.set("name", params.name.trim());
  if (params.category) query.set("category", params.category);
  if (params.genre) query.set("genre", String(params.genre));
  if (params.status) query.set("status", params.status);
  if (typeof params.minPrice === "number") {
    query.set("minPrice", String(params.minPrice));
  }
  if (typeof params.maxPrice === "number") {
    query.set("maxPrice", String(params.maxPrice));
  }

  for (const size of params.sizes || []) {
    query.append("size", size);
  }

  const response = await fetch(
    buildApiUrl(`/api/products/get?${query.toString()}`, options.baseUrl),
    {
      cache: options.cache ?? "no-store",
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<PaginatedProducts>(
    response,
    "Error al cargar productos",
  );
};

export const getProductById = async (
  id: string,
  options: ApiOptions = {},
): Promise<Product> => {
  const response = await fetch(
    buildApiUrl(`/api/products/get/${id}`, options.baseUrl),
    {
      cache: options.cache ?? "no-store",
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<Product>(response, "Error al cargar producto");
};

export const createProduct = async (
  input: CreateProduct,
  options: ApiOptions = {},
): Promise<Product> => {
  const response = await fetch(
    buildApiUrl("/api/products/create", options.baseUrl),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<Product>(response, "Error al crear producto");
};

export const updateProduct = async (
  id: string,
  input: Partial<UploadProduct>,
  options: ApiOptions = {},
): Promise<Product> => {
  const payload: UploadProduct = {
    ...(input as UploadProduct),
    id,
  };

  const response = await fetch(
    buildApiUrl(`/api/products/update/${id}`, options.baseUrl),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<Product>(
    response,
    "Error al actualizar producto",
  );
};
