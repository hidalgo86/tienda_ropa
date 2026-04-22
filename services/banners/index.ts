import { getStoredAuthToken, refreshSession } from "@/services/users";
import type {
  Banner,
  CreateBannerInput,
  UpdateBannerInput,
} from "@/types/domain/banners";

interface ApiOptions {
  baseUrl?: string;
  cache?: RequestCache;
  signal?: AbortSignal;
  token?: string | null;
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
    throw new Error(
      typeof data?.error === "string" && data.error.trim()
        ? data.error
        : fallbackErrorMessage,
    );
  }

  return data as T;
};

const buildHeaders = (
  includeJson: boolean = false,
  token?: string | null,
): HeadersInit => {
  const headers: HeadersInit = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
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

const fetchWithAuthRetry = async <T>(
  requestFactory: (token: string) => Promise<T>,
  fallbackErrorMessage: string,
  options: ApiOptions = {},
): Promise<T> => {
  const token = options.token ?? getStoredAuthToken();

  if (!token) {
    throw new Error("No hay sesion activa");
  }

  try {
    return await requestFactory(token);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : fallbackErrorMessage.toLowerCase();

    const shouldRetry =
      !options.token &&
      (message.includes("token") ||
        message.includes("jwt") ||
        message.includes("unauthorized") ||
        message.includes("sesion"));

    if (!shouldRetry) {
      throw error;
    }

    const refreshedTokens = await refreshSession();
    storeRefreshedTokens(refreshedTokens);
    return requestFactory(refreshedTokens.access_token);
  }
};

export const listPublicBanners = async (
  options: ApiOptions = {},
): Promise<Banner[]> => {
  const response = await fetch(buildApiUrl("/api/banners", options.baseUrl), {
    cache: options.cache ?? "no-store",
    signal: options.signal,
  });

  return parseResponseOrThrow<Banner[]>(
    response,
    "Error al cargar banners",
  );
};

export const listAdminBanners = async (
  options: ApiOptions = {},
): Promise<Banner[]> =>
  fetchWithAuthRetry(async (token) => {
    const response = await fetch(
      buildApiUrl("/api/admin/banners", options.baseUrl),
      {
        cache: options.cache ?? "no-store",
        headers: buildHeaders(false, options.token ?? token),
        signal: options.signal,
      },
    );

    return parseResponseOrThrow<Banner[]>(
      response,
      "Error al cargar banners",
    );
  }, "Error al cargar banners", options);

export const createBanner = async (
  input: CreateBannerInput,
  options: ApiOptions = {},
): Promise<Banner> =>
  fetchWithAuthRetry(async (token) => {
    const response = await fetch(
      buildApiUrl("/api/admin/banners", options.baseUrl),
      {
        method: "POST",
        headers: buildHeaders(true, options.token ?? token),
        body: JSON.stringify(input),
        signal: options.signal,
      },
    );

    return parseResponseOrThrow<Banner>(response, "Error al crear banner");
  }, "Error al crear banner", options);

export const updateBanner = async (
  id: string,
  input: UpdateBannerInput,
  options: ApiOptions = {},
): Promise<Banner> =>
  fetchWithAuthRetry(async (token) => {
    const response = await fetch(
      buildApiUrl(`/api/admin/banners/${id}`, options.baseUrl),
      {
        method: "PATCH",
        headers: buildHeaders(true, options.token ?? token),
        body: JSON.stringify(input),
        signal: options.signal,
      },
    );

    return parseResponseOrThrow<Banner>(
      response,
      "Error al actualizar banner",
    );
  }, "Error al actualizar banner", options);

export const deleteBanner = async (
  id: string,
  options: ApiOptions = {},
): Promise<Banner> =>
  fetchWithAuthRetry(async (token) => {
    const response = await fetch(
      buildApiUrl(`/api/admin/banners/${id}`, options.baseUrl),
      {
        method: "DELETE",
        headers: buildHeaders(false, options.token ?? token),
        signal: options.signal,
      },
    );

    return parseResponseOrThrow<Banner>(response, "Error al eliminar banner");
  }, "Error al eliminar banner", options);

export const uploadBannerImage = async (
  file: File,
  options: ApiOptions = {},
): Promise<{ url: string; publicId: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "banners");

  const response = await fetch(
    buildApiUrl("/api/cloudinary/upload", options.baseUrl),
    {
      method: "POST",
      body: formData,
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<{ url: string; publicId: string }>(
    response,
    "Error al subir imagen del banner",
  );
};
