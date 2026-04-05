// app/api/products/update/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  UploadProduct,
  VariantProduct,
  Size,
  ProductStatus,
  allowedSizes,
  Genre,
  parseGenre,
} from "@/types/product.type";

interface GraphqlError {
  message?: string;
}

interface UpdateProductResponse {
  data?: {
    updateProduct?: UploadProduct;
  };
  errors?: GraphqlError[];
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as UploadProduct;
    const { id, images, variants, status, name, description, genre } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

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
    let typedVariants: VariantProduct[] | undefined;
    if (variants) {
      typedVariants = variants
        .map((v) => {
          const size = String(v.size).toUpperCase().trim() as Size;
          if (!allowedSizes.has(size)) return null;
          return { size, stock: Number(v.stock), price: Number(v.price) };
        })
        .filter(Boolean) as VariantProduct[];

      if (!typedVariants.length) {
        return NextResponse.json(
          { error: "Variantes inválidas" },
          { status: 400 },
        );
      }
    }

    // ===== Ajustar status según stock =====
    let finalStatus = status;
    if (typedVariants) {
      const totalStock = typedVariants.reduce(
        (sum, v) => sum + (v.stock || 0),
        0,
      );
      finalStatus =
        totalStock > 0 ? ProductStatus.DISPONIBLE : ProductStatus.AGOTADO;
    }

    // ===== Preparar input para GraphQL =====
    const input: Partial<UploadProduct> = {
      name,
      description,
      images,
      variants: typedVariants,
      genre: parsedGenre,
      status: finalStatus,
    };

    // ===== Validación mínima =====
    if (Object.keys(input).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 },
      );
    }

    const apiUrl = process.env.API_URL?.trim();
    if (!apiUrl) {
      return NextResponse.json(
        { error: "Falta API_URL en variables de entorno" },
        { status: 500 },
      );
    }

    // ===== Mutación GraphQL =====
    const graphqlQuery = {
      query: `
        mutation UpdateProduct($id: String!, $input: UpdateProductInput!) {
          updateProduct(id: $id, input: $input) {
            id
            name
            category
            genre
            description
            images { url publicId }
            variants { size stock price }
            stock
            price
            status
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
        { error: backendData.errors || "Error backend" },
        { status: 500 },
      );
    }

    if (!backendData.data?.updateProduct) {
      return NextResponse.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 },
      );
    }

    return NextResponse.json(backendData.data.updateProduct);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
