import type { Product } from "@/types/domain/products";
import { COOKIE_SESSION_MARKER, getStoredAuthToken } from "@/services/users";

interface FavoriteApiOptions {
  token?: string | null;
  signal?: AbortSignal;
}

const buildHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token && token !== COOKIE_SESSION_MARKER) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const resolveToken = (token?: string | null): string => {
  const resolvedToken = token ?? getStoredAuthToken();
  if (!resolvedToken) {
    throw new Error("No hay sesion activa");
  }
  return resolvedToken;
};

const parseResponseOrThrow = async <T>(response: Response): Promise<T> => {
  const data = (await response.json().catch(() => null)) as
    | T
    | { error?: string }
    | null;

  function hasError(obj: unknown): obj is { error: string } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "error" in obj &&
      typeof (obj as { error?: unknown }).error === "string"
    );
  }
  if (!response.ok) {
    const errorMsg = hasError(data)
      ? data.error
      : "Error al sincronizar favoritos";
    throw new Error(errorMsg);
  }

  return data as T;
};

const ensureProductsArray = (value: unknown): Product[] =>
  Array.isArray(value) ? (value as Product[]) : [];

export const listFavoriteProducts = async (
  options: FavoriteApiOptions = {},
): Promise<Product[]> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/favorites", {
    headers: buildHeaders(token),
    cache: "no-store",
    signal: options.signal,
  });

  const data = await parseResponseOrThrow<unknown>(response);
  return ensureProductsArray(data);
};

export const addFavoriteProduct = async (
  productId: string,
  options: FavoriteApiOptions = {},
): Promise<Product[]> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/favorites/add", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ productId }),
    signal: options.signal,
  });

  const data = await parseResponseOrThrow<unknown>(response);
  return ensureProductsArray(data);
};

export const removeFavoriteProduct = async (
  productId: string,
  options: FavoriteApiOptions = {},
): Promise<Product[]> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/favorites/remove", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ productId }),
    signal: options.signal,
  });

  const data = await parseResponseOrThrow<unknown>(response);
  return ensureProductsArray(data);
};

export const clearFavoriteProducts = async (
  options: FavoriteApiOptions = {},
): Promise<void> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/favorites", {
    method: "DELETE",
    headers: buildHeaders(token),
    signal: options.signal,
  });

  await parseResponseOrThrow<{ success: boolean }>(response);
};
