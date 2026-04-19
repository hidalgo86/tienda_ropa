import type {
  ChangePasswordApiResponse,
  ForgotPasswordApiResponse,
  ForgotUsernameApiResponse,
  LoginUserApiResponse,
  MeApiResponse,
  RefreshTokenApiResponse,
  RegisterUserApiResponse,
  ResendVerificationApiResponse,
  ResetPasswordApiResponse,
  UpdateProfileApiResponse,
  UserApiErrorResponse,
  VerifyEmailApiResponse,
} from "@/types/api/users";
import type {
  AuthSession,
  ChangePasswordInput,
  EmailInput,
  LoginUserInput,
  RegisterUserInput,
  ResendVerificationInput,
  ResetPasswordInput,
  UpdateProfileInput,
  User,
  VerifyEmailInput,
} from "@/types/domain/users";

interface ApiOptions {
  baseUrl?: string;
  cache?: RequestCache;
  signal?: AbortSignal;
  token?: string | null;
}

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_DATA_KEY = "userData";

const genericErrorMessages = new Set([
  "bad request exception",
  "bad request",
  "internal server error",
  "error backend",
  "error del backend",
]);

const isGenericErrorMessage = (value: string): boolean =>
  genericErrorMessages.has(value.trim().toLowerCase());

const extractErrorMessage = (
  value: unknown,
  fallbackErrorMessage: string,
): string => {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue || fallbackErrorMessage;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => extractErrorMessage(item, ""))
      .filter(Boolean);

    return messages.join(". ") || fallbackErrorMessage;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    const nestedMessage = [
      record.originalError,
      record.extensions,
      record.exception,
      record.response,
    ]
      .map((item) => extractErrorMessage(item, ""))
      .find(Boolean);

    if (typeof record.message === "string" && record.message.trim()) {
      const message = record.message.trim();
      if (!isGenericErrorMessage(message) || !nestedMessage) {
        return message;
      }
    }

    if (typeof record.error === "string" && record.error.trim()) {
      const errorMessage = record.error.trim();
      if (!isGenericErrorMessage(errorMessage) || !nestedMessage) {
        return errorMessage;
      }
    }

    if (nestedMessage) {
      return nestedMessage;
    }
  }

  return fallbackErrorMessage;
};

const buildApiUrl = (path: string, baseUrl?: string): string => {
  if (!baseUrl) return path;
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
};

const buildHeaders = (options: ApiOptions, includeJson = false): HeadersInit => {
  const headers: HeadersInit = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return headers;
};

const parseResponseOrThrow = async <T>(
  response: Response,
  fallbackErrorMessage: string,
): Promise<T> => {
  const data = (await response.json().catch(() => null)) as
    | UserApiErrorResponse
    | T
    | null;

  if (!response.ok) {
    const message = extractErrorMessage(
      data && (data as UserApiErrorResponse).error,
      fallbackErrorMessage,
    );
    throw new Error(message);
  }

  return data as T;
};

const isBrowser = (): boolean => typeof window !== "undefined";

export const getStoredAuthToken = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(USER_DATA_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    clearStoredSession();
    return null;
  }
};

export const storeAuthSession = (session: AuthSession): void => {
  if (!isBrowser()) return;

  window.localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(session.user));
};

export const updateStoredUser = (user: User): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

const storeTokens = (tokens: RefreshTokenApiResponse): void => {
  if (!isBrowser()) return;

  window.localStorage.setItem(AUTH_TOKEN_KEY, tokens.access_token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

export const clearStoredSession = (): void => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_DATA_KEY);
};

export const registerUser = async (
  input: RegisterUserInput,
  options: ApiOptions = {},
): Promise<RegisterUserApiResponse> => {
  const response = await fetch(buildApiUrl("/api/users/create", options.baseUrl), {
    method: "POST",
    headers: buildHeaders(options, true),
    body: JSON.stringify(input),
    signal: options.signal,
  });

  return parseResponseOrThrow<RegisterUserApiResponse>(
    response,
    "Error al registrar usuario",
  );
};

export const loginUser = async (
  input: LoginUserInput,
  options: ApiOptions = {},
): Promise<LoginUserApiResponse> => {
  const response = await fetch(buildApiUrl("/api/users/login", options.baseUrl), {
    method: "POST",
    headers: buildHeaders(options, true),
    body: JSON.stringify(input),
    signal: options.signal,
  });

  return parseResponseOrThrow<LoginUserApiResponse>(
    response,
    "Error al iniciar sesion",
  );
};

export const forgotUsername = async (
  input: EmailInput,
  options: ApiOptions = {},
): Promise<ForgotUsernameApiResponse> => {
  const response = await fetch(
    buildApiUrl("/api/users/forgot-username", options.baseUrl),
    {
      method: "POST",
      headers: buildHeaders(options, true),
      body: JSON.stringify(input),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<ForgotUsernameApiResponse>(
    response,
    "Error al recuperar usuario",
  );
};

export const forgotPassword = async (
  input: EmailInput,
  options: ApiOptions = {},
): Promise<ForgotPasswordApiResponse> => {
  const response = await fetch(
    buildApiUrl("/api/users/forgot-password", options.baseUrl),
    {
      method: "POST",
      headers: buildHeaders(options, true),
      body: JSON.stringify(input),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<ForgotPasswordApiResponse>(
    response,
    "Error al solicitar recuperacion de contrasena",
  );
};

export const verifyEmail = async (
  input: VerifyEmailInput,
  options: ApiOptions = {},
): Promise<VerifyEmailApiResponse> => {
  const response = await fetch(buildApiUrl("/api/users/verify", options.baseUrl), {
    method: "POST",
    headers: buildHeaders(options, true),
    body: JSON.stringify(input),
    signal: options.signal,
  });

  return parseResponseOrThrow<VerifyEmailApiResponse>(
    response,
    "Error al verificar el correo",
  );
};

export const resendVerification = async (
  input: ResendVerificationInput,
  options: ApiOptions = {},
): Promise<ResendVerificationApiResponse> => {
  const response = await fetch(
    buildApiUrl("/api/users/resend-verification", options.baseUrl),
    {
      method: "POST",
      headers: buildHeaders(options, true),
      body: JSON.stringify(input),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<ResendVerificationApiResponse>(
    response,
    "Error al reenviar la verificacion",
  );
};

export const resetPassword = async (
  input: ResetPasswordInput,
  options: ApiOptions = {},
): Promise<ResetPasswordApiResponse> => {
  const response = await fetch(
    buildApiUrl("/api/users/reset-password", options.baseUrl),
    {
      method: "POST",
      headers: buildHeaders(options, true),
      body: JSON.stringify(input),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<ResetPasswordApiResponse>(
    response,
    "Error al restablecer la contrasena",
  );
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
  } catch (requestError) {
    const message =
      requestError instanceof Error
        ? requestError.message.toLowerCase()
        : fallbackErrorMessage.toLowerCase();

    const shouldRetry =
      !options.token &&
      (message.includes("token") ||
        message.includes("jwt") ||
        message.includes("unauthorized") ||
        message.includes("unauthoriz") ||
        message.includes("sesion"));

    if (!shouldRetry) {
      throw requestError;
    }

    const refreshedTokens = await refreshSession(options);
    storeTokens(refreshedTokens);

    return requestFactory(refreshedTokens.access_token);
  }
};

export const getCurrentUser = async (
  options: ApiOptions = {},
): Promise<MeApiResponse> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch(buildApiUrl("/api/users/me", options.baseUrl), {
      headers: buildHeaders({ ...options, token }),
      cache: options.cache ?? "no-store",
      signal: options.signal,
    });

    return parseResponseOrThrow<MeApiResponse>(
      response,
      "Error al obtener el perfil",
    );
  }, "Error al obtener el perfil", options);
};

export const updateProfile = async (
  input: UpdateProfileInput,
  options: ApiOptions = {},
): Promise<UpdateProfileApiResponse> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch(
      buildApiUrl("/api/users/update-profile", options.baseUrl),
      {
        method: "PATCH",
        headers: buildHeaders({ ...options, token }, true),
        body: JSON.stringify(input),
        signal: options.signal,
      },
    );

    return parseResponseOrThrow<UpdateProfileApiResponse>(
      response,
      "Error al actualizar el perfil",
    );
  }, "Error al actualizar el perfil", options);
};

export const changePassword = async (
  input: ChangePasswordInput,
  options: ApiOptions = {},
): Promise<ChangePasswordApiResponse> => {
  return fetchWithAuthRetry(async (token) => {
    const response = await fetch(
      buildApiUrl("/api/users/change-password", options.baseUrl),
      {
        method: "POST",
        headers: buildHeaders({ ...options, token }, true),
        body: JSON.stringify(input),
        signal: options.signal,
      },
    );

    return parseResponseOrThrow<ChangePasswordApiResponse>(
      response,
      "Error al cambiar la contrasena",
    );
  }, "Error al cambiar la contrasena", options);
};

export const refreshSession = async (
  options: ApiOptions = {},
): Promise<RefreshTokenApiResponse> => {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("No hay refresh token disponible");
  }

  const response = await fetch(
    buildApiUrl("/api/users/refresh-token", options.baseUrl),
    {
      method: "POST",
      headers: buildHeaders(options, true),
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: options.signal,
    },
  );

  return parseResponseOrThrow<RefreshTokenApiResponse>(
    response,
    "Error al refrescar la sesion",
  );
};
