import type { Order, OrderItem, ShippingAddress } from "@/types/domain/orders";
import {
  getStoredAuthToken,
  refreshSession,
  type PaginatedResult,
} from "@/services/users";

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

const storeRefreshedTokens = (tokens: {
  access_token: string;
  refresh_token: string;
}) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("authToken", tokens.access_token);
  window.localStorage.setItem("refreshToken", tokens.refresh_token);
  window.dispatchEvent(new Event("auth:session-changed"));
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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const normalizeOrderItem = (value: unknown): OrderItem => {
  const item = asRecord(value);

  return {
    productId: String(item.productId ?? ""),
    variantName:
      typeof item.variantName === "string" ? item.variantName : null,
    quantity: Number(item.quantity ?? 0),
    productName: String(item.productName ?? ""),
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : null,
    unitPrice: Number(item.unitPrice ?? 0),
    lineTotal: Number(item.lineTotal ?? 0),
  };
};

const normalizeShippingAddress = (value: unknown): ShippingAddress => {
  const address = asRecord(value);

  return {
    address: String(address.address ?? ""),
    name: typeof address.name === "string" ? address.name : null,
    phone: typeof address.phone === "string" ? address.phone : null,
  };
};

const normalizeOrder = (value: unknown): Order => {
  const order = asRecord(value);

  return {
    id: String(order.id ?? ""),
    userId: String(order.userId ?? ""),
    items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
    totalAmount: Number(order.totalAmount ?? 0),
    shippingAddress: normalizeShippingAddress(order.shippingAddress),
    status: String(order.status ?? ""),
    paymentMethod: String(order.paymentMethod ?? ""),
    paymentReference:
      typeof order.paymentReference === "string"
        ? order.paymentReference
        : null,
    paidAt: typeof order.paidAt === "string" ? order.paidAt : null,
    cancelledAt:
      typeof order.cancelledAt === "string" ? order.cancelledAt : null,
    createdAt: typeof order.createdAt === "string" ? order.createdAt : null,
    updatedAt: typeof order.updatedAt === "string" ? order.updatedAt : null,
  };
};

const normalizeOrders = (value: unknown): Order[] =>
  Array.isArray(value) ? value.map(normalizeOrder) : [];

const fetchWithAuthRetry = async <T>(
  requestFactory: (token: string) => Promise<T>,
  options: OrderApiOptions = {},
): Promise<T> => {
  const token = options.token ?? getStoredAuthToken();

  if (!token) {
    throw new Error("No hay sesion activa");
  }

  try {
    return await requestFactory(token);
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    const shouldRetry =
      !options.token &&
      (message.includes("token") ||
        message.includes("jwt") ||
        message.includes("unauthorized") ||
        message.includes("unauthoriz") ||
        message.includes("sesion"));

    if (!shouldRetry) {
      throw error;
    }

    const refreshedTokens = await refreshSession();
    storeRefreshedTokens(refreshedTokens);

    return requestFactory(refreshedTokens.access_token);
  }
};

export const checkoutCart = async (
  options: OrderApiOptions = {},
): Promise<Order> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch("/api/orders/checkout", {
      method: "POST",
      headers: buildHeaders(token),
      signal: options.signal,
    });

    return parseResponseOrThrow<Order>(response);
  }, options);
};

export const listMyOrders = async (
  options: OrderApiOptions = {},
): Promise<Order[]> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch("/api/orders", {
      headers: buildHeaders(token),
      cache: "no-store",
      signal: options.signal,
    });

    const data = await parseResponseOrThrow<unknown>(response);
    return normalizeOrders(data);
  }, options);
};

export const payOrder = async (
  orderId: string,
  options: OrderApiOptions = {},
): Promise<Order> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch("/api/orders/pay", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ orderId }),
      signal: options.signal,
    });

    return parseResponseOrThrow<Order>(response);
  }, options);
};

export const cancelOrder = async (
  orderId: string,
  options: OrderApiOptions = {},
): Promise<Order> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch("/api/orders/cancel", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ orderId }),
      signal: options.signal,
    });

    return parseResponseOrThrow<Order>(response);
  }, options);
};

export interface AdminOrder extends Order {
  user?: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    status: string;
    role: string;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
}

interface ListAdminOrdersParams {
  orderId?: string;
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
}

export const listAdminOrders = async (
  params: ListAdminOrdersParams = {},
  options: OrderApiOptions = {},
): Promise<PaginatedResult<AdminOrder>> => {
  return fetchWithAuthRetry(async (token) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 20));
    if (params.orderId?.trim()) query.set("orderId", params.orderId.trim());
    if (params.userId?.trim()) query.set("userId", params.userId.trim());
    if (params.status?.trim()) query.set("status", params.status.trim());

    const response = await fetch(`/api/admin/orders?${query.toString()}`, {
      headers: buildHeaders(token),
      cache: "no-store",
      signal: options.signal,
    });

    return parseResponseOrThrow<PaginatedResult<AdminOrder>>(response);
  }, options);
};

export const adminPayOrder = async (
  orderId: string,
  options: OrderApiOptions = {},
): Promise<AdminOrder> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch("/api/admin/orders/pay", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ orderId }),
      signal: options.signal,
    });

    return parseResponseOrThrow<AdminOrder>(response);
  }, options);
};

export const adminCancelOrder = async (
  orderId: string,
  options: OrderApiOptions = {},
): Promise<AdminOrder> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch("/api/admin/orders/cancel", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify({ orderId }),
      signal: options.signal,
    });

    return parseResponseOrThrow<AdminOrder>(response);
  }, options);
};
