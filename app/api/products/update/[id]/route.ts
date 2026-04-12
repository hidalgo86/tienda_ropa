// app/api/products/update/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  Genre,
  parseProductState,
  UploadProduct,
  VariantProduct,
  getVariantName,
  parseGenre,
} from "@/types/product.type";
import { toGraphqlGenre, toGraphqlState } from "@/lib/graphqlMappers";
import { normalizeProduct } from "../../normalizeProduct";

interface GraphqlError {
  message?: string;
}

interface UpdateProductResponse {
  data?: {
    updateProduct?: unknown;
  };
  errors?: GraphqlError[];
}

const genericErrorMessages = new Set([
  "bad request exception",
  "bad request",
  "internal server error",
  "error backend",
]);

const isGenericErrorMessage = (value: string): boolean =>
  genericErrorMessages.has(value.trim().toLowerCase());

const extractGraphqlErrorMessage = (value: unknown): string => {
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value))
    return value.map(extractGraphqlErrorMessage).filter(Boolean).join(". ");

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nestedMessage = [
      record.originalError,
      record.extensions,
      record.exception,
      record.response,
    ]
      .map(extractGraphqlErrorMessage)
      .find(Boolean);

    if (typeof record.message === "string" && record.message.trim()) {
      const message = record.message.trim();
      if (!isGenericErrorMessage(message) || !nestedMessage) return message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      const errorMessage = record.error.trim();
      if (!isGenericErrorMessage(errorMessage) || !nestedMessage)
        return errorMessage;
    }

    if (nestedMessage) return nestedMessage;
  }

  return "";
};

const getGraphqlErrorMessage = (errors?: GraphqlError[]): string => {
  const messages = (errors || [])
    .map(extractGraphqlErrorMessage)
    .filter(Boolean);
  return messages.join(". ") || "Error backend";
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = (await req.json()) as UploadProduct;
    const {
      images,
      variants,
      state,
      name,
      description,
      categoryId,
      brand,
      thumbnail,
      genre,
      stock,
      price,
    } = body;

    // ===== Validar género si existe =====
    let parsedGenre: Genre | undefined;
    if (genre) {
      const normalizedGenre = parseGenre(genre);
      if (!normalizedGenre) {
        return NextResponse.json(
          { error: `Género inválido: ${genre}` },
          { status: 400 },
        );
      }
      parsedGenre = normalizedGenre;
    }

    // ===== Validar variantes si existen =====
    let typedVariants:
      | Array<{
          name: string;
          stock: number;
          price: number;
          image?: string;
        }>
      | undefined;
    if (variants) {
      typedVariants = variants
        .map((v) => {
          const name = getVariantName(v).trim();
          if (!name) return null;

          const normalizedStock = Number(v.stock);
          const normalizedPrice = Number(v.price);

          if (
            !Number.isFinite(normalizedStock) ||
            normalizedStock < 0 ||
            !Number.isFinite(normalizedPrice) ||
            normalizedPrice < 0
          ) {
            return null;
          }

          return {
            name,
            stock: normalizedStock,
            price: normalizedPrice,
            image: v.image,
          };
        })
        .filter(Boolean) as VariantProduct[];

      if (!typedVariants.length) {
        return NextResponse.json(
          { error: "Variantes inválidas" },
          { status: 400 },
        );
      }
    }

    const normalizedState = parseProductState(state) ?? undefined;

    // ===== Preparar input para GraphQL =====
    const input: Record<string, unknown> = {
      name,
      categoryId,
      description,
      brand,
      thumbnail,
      images,
      variants: typedVariants as VariantProduct[] | undefined,
      stock,
      price,
      genre: toGraphqlGenre(parsedGenre),
      state: toGraphqlState(normalizedState),
    };

    if (Object.keys(input).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 },
      );
    }

    const apiUrl = process.env.API_URL?.trim();
    if (!apiUrl)
      return NextResponse.json(
        { error: "Falta API_URL en variables de entorno" },
        { status: 500 },
      );

    // ===== Mutación GraphQL =====
    const graphqlQuery = {
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
    };

    const backendRes = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery),
    });

    const backendData = (await backendRes.json()) as UpdateProductResponse;
    if (!backendRes.ok || backendData.errors) {
      return NextResponse.json(
        { error: getGraphqlErrorMessage(backendData.errors) },
        { status: 500 },
      );
    }

    if (!backendData.data?.updateProduct) {
      return NextResponse.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 },
      );
    }

    return NextResponse.json(normalizeProduct(backendData.data.updateProduct));
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 },
    );
  }
}
