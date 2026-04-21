import type { CartItem } from "@/store/slices/cartSlice";
import { getStoredAuthToken } from "@/services/users";

interface CartApiOptions {
  token?: string | null;
  signal?: AbortSignal;
}

const buildHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
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
      : "Error al sincronizar carrito";
    throw new Error(errorMsg);
  }

  return data as T;
};

export const listCartItems = async (
  options: CartApiOptions = {},
): Promise<CartItem[]> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/cart", {
    headers: buildHeaders(token),
    cache: "no-store",
    signal: options.signal,
  });

  return parseResponseOrThrow<CartItem[]>(response);
};

export const upsertCartItem = async (
  input: { productId: string; quantity: number; variantName?: string },
  options: CartApiOptions = {},
): Promise<CartItem[]> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(input),
    signal: options.signal,
  });

  return parseResponseOrThrow<CartItem[]>(response);
};

export const clearRemoteCart = async (
  options: CartApiOptions = {},
): Promise<void> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/cart", {
    method: "DELETE",
    headers: buildHeaders(token),
    signal: options.signal,
  });

  await parseResponseOrThrow<{ success: boolean }>(response);
};
