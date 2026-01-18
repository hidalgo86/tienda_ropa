import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const query = `
    query ($id: String!) {
      product(id: $id) {
        id
        name
        description
        genre
        imageUrl
        imagePublicId
        status
        variants { size stock price }
        createdAt
        updatedAt
      }
    }
  `;

  const variables = { id };
  try {
    const res = await fetch(process.env.API_URL! + "/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();

    const errors: Array<{ message?: string }> | undefined = Array.isArray(
      data?.errors
    )
      ? data.errors
      : undefined;
    if (errors && errors.length) {
      const message = errors
        .map((e) => (typeof e?.message === "string" ? e.message : "Error"))
        ?.join(", ");
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const product = data.data.product;
    return NextResponse.json(product);
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message ?? "Error interno")
        : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
