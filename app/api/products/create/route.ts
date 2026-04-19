// app/api/products/create/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { CreateProductRouteError } from "./createProduct.error";
import { buildCreateProductInput } from "./createProductInput";
import { createProductInBackend } from "./createProductMutation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productInput = buildCreateProductInput(body);
    const product = await createProductInBackend(productInput);

    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof CreateProductRouteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
