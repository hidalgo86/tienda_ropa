// app/api/products/create/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import type { CreateProduct, VariantProduct, Size } from "@/types/product.type";
import { allowedSizes, parseGenre } from "@/types/product.type";

interface GraphqlError {
  message?: string;
}

interface CreateProductResponse {
  data?: {
    createProduct?: CreateProduct;
  };
  errors?: GraphqlError[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 👀 Tipamos la entrada con nuestro type
    const input: CreateProduct = body;

    // Validación mínima de campos obligatorios
    if (!input.name || !input.category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: name y category" },
        { status: 400 },
      );
    }

    if (!Array.isArray(input.images) || input.images.length === 0) {
      return NextResponse.json(
        { error: "Debes enviar al menos una imagen en 'images'" },
        { status: 400 },
      );
    }

    let typedVariants: VariantProduct[] | undefined = undefined;

    if (input.category === "ROPA") {
      if (!Array.isArray(input.variants) || input.variants.length === 0) {
        return NextResponse.json(
          { error: "Los productos de ropa deben tener al menos una variante" },
          { status: 400 },
        );
      }

      typedVariants = input.variants.map((v) => ({
        size: String(v.size).trim().toUpperCase() as Size,
        stock: Number(v.stock),
        price: Number(v.price),
      }));

      // Validar tallas
      if (!typedVariants.every((v) => allowedSizes.has(v.size))) {
        return NextResponse.json(
          {
            error:
              "Talla inválida en variants. Usa RN, M3, M6, M9, M12, M18, M24, T2, T3, T4, T5, T6, T7, T8, T9, T10 o T12",
          },
          { status: 400 },
        );
      }

      // Validar género
      const parsedGenre = parseGenre(input.genre);
      if (!parsedGenre) {
        return NextResponse.json(
          { error: `Género inválido: ${input.genre}` },
          { status: 400 },
        );
      }
      input.genre = parsedGenre;
    }

    // Preparar objeto para enviar a backend GraphQL
    const productInput: CreateProduct = {
      name: input.name,
      category: input.category,
      description: input.description,
      images: input.images,
    };

    if (input.category === "ROPA") {
      productInput.genre = input.genre;
      productInput.variants = typedVariants;
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
        { error: backendData.errors || "Error del backend" },
        { status: backendRes.status },
      );
    }

    if (!backendData.data?.createProduct) {
      return NextResponse.json(
        { error: "Respuesta inválida del backend" },
        { status: 500 },
      );
    }

    return NextResponse.json(backendData.data.createProduct);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
