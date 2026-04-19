import type { NextRequest } from "next/server";
import { UserApiRouteError } from "./userApi.error";

type GraphqlError = {
  message?: string;
};

type GraphqlResponse<TData> = {
  data?: TData;
  errors?: GraphqlError[];
};

type ExecuteGraphqlOptions<TVariables> = {
  query: string;
  variables?: TVariables;
  request?: NextRequest;
};

const getApiUrl = (): string => {
  const apiUrl = process.env.API_URL?.trim();

  if (!apiUrl) {
    throw new UserApiRouteError("Falta API_URL en variables de entorno", 500);
  }

  return apiUrl;
};

const getGraphqlErrorMessage = (errors?: GraphqlError[]): string => {
  const message = errors?.find((error) => error.message?.trim())?.message?.trim();
  return message || "Error del backend";
};

const buildHeaders = (request?: NextRequest): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const authorization = request?.headers.get("authorization");
  if (authorization) {
    headers.Authorization = authorization;
  }

  return headers;
};

export const executeUsersGraphql = async <TData, TVariables = undefined>({
  query,
  variables,
  request,
}: ExecuteGraphqlOptions<TVariables>): Promise<TData> => {
  const response = await fetch(`${getApiUrl()}/graphql`, {
    method: "POST",
    headers: buildHeaders(request),
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GraphqlResponse<TData>;

  if (!response.ok || payload.errors?.length) {
    throw new UserApiRouteError(
      getGraphqlErrorMessage(payload.errors),
      response.status || 500,
    );
  }

  if (!payload.data) {
    throw new UserApiRouteError("Respuesta invalida del backend", 500);
  }

  return payload.data;
};
