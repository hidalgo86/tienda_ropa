import type { Order } from "@/types/domain/orders";
import { getStoredAuthToken } from "@/services/users";

interface OrderApiOptions {
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
      : "No se pudo completar la compra";
    throw new Error(errorMsg);
  }

  return data as T;
};

export const checkoutCart = async (
  options: OrderApiOptions = {},
): Promise<Order> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/orders/checkout", {
    method: "POST",
    headers: buildHeaders(token),
    signal: options.signal,
  });

  return parseResponseOrThrow<Order>(response);
};

export const listMyOrders = async (
  options: OrderApiOptions = {},
): Promise<Order[]> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/orders", {
    headers: buildHeaders(token),
    cache: "no-store",
    signal: options.signal,
  });

  return parseResponseOrThrow<Order[]>(response);
};

export const payOrder = async (
  orderId: string,
  options: OrderApiOptions = {},
): Promise<Order> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/orders/pay", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ orderId }),
    signal: options.signal,
  });

  return parseResponseOrThrow<Order>(response);
};

export const cancelOrder = async (
  orderId: string,
  options: OrderApiOptions = {},
): Promise<Order> => {
  const token = resolveToken(options.token);
  const response = await fetch("/api/orders/cancel", {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify({ orderId }),
    signal: options.signal,
  });

  return parseResponseOrThrow<Order>(response);
};
