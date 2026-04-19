import type {
  GraphqlError,
  UpdateProductGraphqlInput,
  UpdateProductMutationResponse,
} from "@/types/api/products/graphql";
import type { Product } from "@/types/domain/products";
import { normalizeProduct } from "../../normalizeProduct";
import { UpdateProductRouteError } from "./updateProduct.error";

const getGraphqlErrorMessage = (errors?: GraphqlError[]): string => {
  const message = errors
    ?.find((error) => error.message?.trim())
    ?.message?.trim();
  return message || "Error del backend";
};

export const updateProductInBackend = async (
  id: string,
  input: UpdateProductGraphqlInput,
): Promise<Product> => {
  const apiUrl = process.env.API_URL?.trim();
  if (!apiUrl) {
    throw new UpdateProductRouteError(
      "Falta API_URL en variables de entorno",
      500,
    );
  }

  const backendRes = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
          updateProduct(id: $id, input: $input) {
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
      variables: { id, input },
    }),
  });

  const backendData =
    (await backendRes.json()) as UpdateProductMutationResponse;
  if (!backendRes.ok || backendData.errors) {
    throw new UpdateProductRouteError(
      getGraphqlErrorMessage(backendData.errors),
      backendRes.status || 500,
    );
  }

  if (!backendData.data?.updateProduct) {
    throw new UpdateProductRouteError("Respuesta inválida del backend", 500);
  }

  return normalizeProduct(backendData.data.updateProduct);
};
