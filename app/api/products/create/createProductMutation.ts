// src/app/api/products/create/createProductMutation.ts
import type {
  CreateProductGraphqlInput,
  CreateProductMutationResponse,
  GraphqlError,
} from "@/types/api/products/graphql";
import type { Product } from "@/types/domain/products";
import { normalizeProduct } from "../normalizeProduct";
import { CreateProductRouteError } from "./createProduct.error";

const getGraphqlErrorMessage = (errors?: GraphqlError[]): string => {
  const message = errors
    ?.find((error) => error.message?.trim())
    ?.message?.trim();
  return message || "Error del backend";
};

export const createProductInBackend = async (
  input: CreateProductGraphqlInput,
): Promise<Product> => {
  const apiUrl = process.env.API_URL?.trim();
  if (!apiUrl) {
    throw new CreateProductRouteError(
      "Falta API_URL en variables de entorno",
      500,
    );
  }

  const backendRes = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            id
            sku
            slug
            categoryId
            name
            description
            brand
            thumbnail
            genre
            images { url publicId }
            variants { name stock price image }
            stock
            price
            state
            availability
            stats { views favorites cartAdds purchases searches }
            createdAt
            updatedAt
          }
        }
      `,
      variables: { input },
    }),
  });

  const backendData =
    (await backendRes.json()) as CreateProductMutationResponse;
  if (!backendRes.ok || backendData.errors) {
    throw new CreateProductRouteError(
      getGraphqlErrorMessage(backendData.errors),
      backendRes.status || 500,
    );
  }

  if (!backendData.data?.createProduct) {
    throw new CreateProductRouteError("Respuesta inválida del backend", 500);
  }

  return normalizeProduct(backendData.data.createProduct);
};
