
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
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

    if (data?.errors?.length) {
      return NextResponse.json({ error: data.errors.map((e: any) => e.message).join(", ") }, { status: 500 });
    }

    const product = data.data.product;
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}