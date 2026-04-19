// app/api/products/update/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { UpdateProductRouteError } from "./updateProduct.error";
import { buildUpdateProductInput } from "./updateProductInput";
import { updateProductInBackend } from "./updateProductMutation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const body = await req.json();
    const input = buildUpdateProductInput(body);
    const product = await updateProductInBackend(id, input);

    return NextResponse.json(product);
  } catch (error: unknown) {
    if (error instanceof UpdateProductRouteError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 },
    );
  }
}
