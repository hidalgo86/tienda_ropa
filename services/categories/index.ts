import type { Category } from "@/types/domain/products";
import { getStoredAuthToken } from "@/services/users";

interface ApiOptions {
  baseUrl?: string;
  cache?: RequestCache;
  signal?: AbortSignal;
  token?: string | null;
}

export interface CategoryInput {
  name: string;
  slug: string;
  parentId?: string;
}

const buildApiUrl = (path: string, baseUrl?: string): string => {
  if (!baseUrl) return path;
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
};

export const listCategories = async (
  options: ApiOptions = {},
): Promise<Category[]> => {
  const response = await fetch(
    buildApiUrl("/api/categories/get", options.baseUrl),
    {
      cache: options.cache ?? "no-store",
      signal: options.signal,
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : "Error al cargar categorías",
    );
  }

  return Array.isArray(data) ? (data as Category[]) : [];
};

const buildHeaders = (options: ApiOptions, includeJson = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (includeJson) headers["Content-Type"] = "application/json";

  const token = options.token ?? getStoredAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
};

const parseCategoryResponse = async (
  response: Response,
  fallbackMessage: string,
): Promise<Category> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" && data.error.trim()
        ? data.error
        : fallbackMessage,
    );
  }

  return data as Category;
};

export const createCategory = async (
  input: CategoryInput,
  options: ApiOptions = {},
): Promise<Category> => {
  const response = await fetch(buildApiUrl("/api/categories", options.baseUrl), {
    method: "POST",
    headers: buildHeaders(options, true),
    body: JSON.stringify(input),
    signal: options.signal,
  });

  return parseCategoryResponse(response, "Error al crear categoria");
};

export const updateCategory = async (
  id: string,
  input: Partial<CategoryInput>,
  options: ApiOptions = {},
): Promise<Category> => {
  const response = await fetch(
    buildApiUrl(`/api/categories/${id}`, options.baseUrl),
    {
      method: "PATCH",
      headers: buildHeaders(options, true),
      body: JSON.stringify(input),
      signal: options.signal,
    },
  );

  return parseCategoryResponse(response, "Error al actualizar categoria");
};

export const deleteCategory = async (
  id: string,
  options: ApiOptions = {},
): Promise<Category> => {
  const response = await fetch(
    buildApiUrl(`/api/categories/${id}`, options.baseUrl),
    {
      method: "DELETE",
      headers: buildHeaders(options),
      signal: options.signal,
    },
  );

  return parseCategoryResponse(response, "Error al eliminar categoria");
};
