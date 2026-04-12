// app/api/products/create/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import type { CreateProduct, VariantProduct } from "@/types/product.type";
import { Genre, getVariantName, parseGenre } from "@/types/product.type";
import { normalizeProduct } from "../normalizeProduct";

interface GraphqlError {
  message?: string;
}

interface CreateProductResponse {
  data?: {
    createProduct?: unknown;
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

  if (Array.isArray(value)) {
    return value.map(extractGraphqlErrorMessage).filter(Boolean).join(". ");
  }

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

  return "";
};

const getGraphqlErrorMessage = (errors?: GraphqlError[]): string => {
  const messages = (errors || [])
    .map(extractGraphqlErrorMessage)
    .filter(Boolean);

  return messages.join(". ") || "Error del backend";
};

const isValidMongoId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

const isValidUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const toGraphqlGenre = (
  genre?: Genre,
): "NINA" | "NINO" | "UNISEX" | undefined => {
  if (!genre) return undefined;
  if (genre === Genre.NINA) return "NINA";
  if (genre === Genre.NINO) return "NINO";
  return "UNISEX";
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: CreateProduct = body;
    const normalizedName = String(input.name || "").trim();
    const normalizedCategoryId = String(input.categoryId || "").trim();
    const normalizedDescription =
      typeof input.description === "string"
        ? input.description.trim()
        : undefined;
    const normalizedBrand =
      typeof input.brand === "string" ? input.brand.trim() : undefined;
    const normalizedThumbnail =
      typeof input.thumbnail === "string" ? input.thumbnail.trim() : undefined;

    if (!normalizedName || !normalizedCategoryId) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: name y categoryId" },
        { status: 400 },
      );
    }

    if (!isValidMongoId(normalizedCategoryId)) {
      return NextResponse.json(
        { error: "categoryId debe ser un ObjectId válido" },
        { status: 400 },
      );
    }

    if (normalizedThumbnail && !isValidUrl(normalizedThumbnail)) {
      return NextResponse.json(
        { error: "thumbnail debe ser una URL válida" },
        { status: 400 },
      );
    }

    const normalizedImages = Array.isArray(input.images)
      ? input.images.map((image) => ({
          url: String(image?.url || "").trim(),
          publicId: String(image?.publicId || "").trim(),
        }))
      : undefined;

    if (normalizedImages && normalizedImages.length === 0) {
      return NextResponse.json(
        { error: "images no puede ser un arreglo vacío" },
        { status: 400 },
      );
    }

    if (
      normalizedImages?.some(
        (image) => !image.url || !image.publicId || !isValidUrl(image.url),
      )
    ) {
      return NextResponse.json(
        { error: "Cada imagen debe incluir una url válida y un publicId" },
        { status: 400 },
      );
    }

    const sourceVariants = Array.isArray(input.variants) ? input.variants : [];
    const hasVariants = sourceVariants.length > 0;

    const typedVariants = hasVariants
      ? sourceVariants.map((variant) => ({
          name: getVariantName(variant).trim(),
          stock: Number(variant.stock),
          price: Number(variant.price),
          image:
            typeof variant.image === "string"
              ? variant.image.trim()
              : undefined,
        }))
      : undefined;

    if (Array.isArray(input.variants) && input.variants.length === 0) {
      return NextResponse.json(
        { error: "variants no puede ser un arreglo vacío" },
        { status: 400 },
      );
    }

    if (
      typedVariants?.some(
        (variant) =>
          !variant.name ||
          !Number.isFinite(variant.stock) ||
          variant.stock < 0 ||
          !Number.isInteger(variant.stock) ||
          !Number.isFinite(variant.price) ||
          variant.price < 0 ||
          (variant.image ? !isValidUrl(variant.image) : false),
      )
    ) {
      return NextResponse.json(
        { error: "Las variantes deben tener nombre, stock y precio válidos" },
        { status: 400 },
      );
    }

    if (
      typedVariants &&
      new Set(typedVariants.map((variant) => variant.name.toLowerCase()))
        .size !== typedVariants.length
    ) {
      return NextResponse.json(
        { error: "Los nombres de variantes no deben repetirse" },
        { status: 400 },
      );
    }

    let parsedGenre: Genre | undefined;
    if (input.genre !== undefined) {
      parsedGenre = parseGenre(input.genre) ?? undefined;
      if (!parsedGenre) {
        return NextResponse.json(
          { error: `Género inválido: ${input.genre}` },
          { status: 400 },
        );
      }
    }

    if (!hasVariants) {
      const normalizedStock = Number(input.stock);
      const normalizedPrice = Number(input.price);

      if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
        return NextResponse.json(
          { error: "El producto simple debe tener un precio válido" },
          { status: 400 },
        );
      }

      if (!Number.isFinite(normalizedStock) || normalizedStock < 0) {
        return NextResponse.json(
          { error: "El producto simple debe tener un stock válido" },
          { status: 400 },
        );
      }
    }

    const productInput: Record<string, unknown> = {
      categoryId: normalizedCategoryId,
      name: normalizedName,
    };

    if (normalizedDescription) {
      productInput.description = normalizedDescription;
    }

    if (normalizedBrand) {
      productInput.brand = normalizedBrand;
    }

    if (normalizedThumbnail) {
      productInput.thumbnail = normalizedThumbnail;
    }

    if (normalizedImages) {
      productInput.images = normalizedImages;
    }

    if (parsedGenre) {
      productInput.genre = toGraphqlGenre(parsedGenre);
    }

    if (hasVariants) {
      productInput.variants = typedVariants as VariantProduct[];
    } else {
      productInput.stock = Number(input.stock ?? 0);
      productInput.price = Number(input.price ?? 0);
    }

    // Validar URL del backend
    const apiUrl = process.env.API_URL?.trim();
    if (!apiUrl) {
      return NextResponse.json(
        { error: "Falta API_URL en variables de entorno" },
        { status: 500 },
      );
    }

    // GraphQL mutation
    const graphqlQuery = {
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
      variables: { input: productInput },
    };

    const backendRes = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphqlQuery),
    });

    const backendData = (await backendRes.json()) as CreateProductResponse;
    if (!backendRes.ok || backendData.errors) {
      return NextResponse.json(
        { error: getGraphqlErrorMessage(backendData.errors) },
        { status: backendRes.status || 500 },
      );
    }

    if (!backendData.data?.createProduct) {
      return NextResponse.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 },
      );
    }

    return NextResponse.json(normalizeProduct(backendData.data.createProduct));
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
