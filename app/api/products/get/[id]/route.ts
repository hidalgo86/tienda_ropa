// app/api/products/get/[id]/route.ts
import { NextResponse } from "next/server";

interface GraphqlError {
  message?: string;
}

interface ProductByIdResponse {
  data?: {
    product?: unknown;
  };
  errors?: GraphqlError[];
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const query = `
    query ($id: String!) {
      product(id: $id) {
        id
        name
        description
        genre
        category
        status
        variants { size stock price }
        images { url publicId }
        stock
        price
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const res = await fetch(`${process.env.API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id } }),
    });

    const data = (await res.json()) as ProductByIdResponse;

    if (data.errors?.length) {
      const message = data.errors.map((e) => e.message || "Error").join(", ");
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!data.data?.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data.data.product);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 },
    );
  }
}
