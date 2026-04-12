// app/api/products/get/route.ts
import { NextResponse } from "next/server";
import {
  allowedSizes,
  PaginatedProducts,
  ProductsQueryModel,
  Size,
  parseGenre,
  parseProductAvailability,
  parseProductState,
} from "@/types/product.type";
import {
  toGraphqlAvailability,
  toGraphqlGenre,
  toGraphqlState,
} from "@/lib/graphqlMappers";
import { normalizeProductsPage } from "../normalizeProduct";

export const dynamic = "force-dynamic";

const parseOptionalNumber = (value: string | null): number | undefined => {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildProductsQueryInput = (
  filters: ProductsQueryModel["filters"],
  pagination: ProductsQueryModel["pagination"],
) => {
  return {
    filters: {
      name: filters.name,
      categoryId: filters.categoryId,
      genre: toGraphqlGenre(filters.genre),
      variantNames: filters.variantNames,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      state: toGraphqlState(filters.state),
      availability: toGraphqlAvailability(filters.availability),
    },
    pagination,
  };
};

const query = `
  query Products($input: ProductsQueryInput!) {
    products(input: $input) {
      items {
        id
        sku
        slug
        categoryId
        name
        description
        brand
        thumbnail
        genre
        state
        availability
        images {
          url
          publicId
        }
        variants {
          name
          stock
          price
          image
        }
        stock
        price
        stats {
          views
          favorites
          cartAdds
          purchases
          searches
        }
        createdAt
        updatedAt
      }
      total
      page
      totalPages
    }
  }
`;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const name = searchParams.get("name") || undefined;
    const categoryId = searchParams.get("categoryId")?.trim() || undefined;
    const category = searchParams.get("category")?.trim() || undefined;
    const genre = parseGenre(searchParams.get("genre")) ?? undefined;
    const state = parseProductState(searchParams.get("state")) ?? undefined;
    const availability =
      parseProductAvailability(searchParams.get("availability")) ?? undefined;
    const sizes = searchParams
      .getAll("size")
      .map((size) => String(size).trim().toUpperCase())
      .filter((size): size is Size => allowedSizes.has(size as Size));
    const variantNames = searchParams
      .getAll("variantName")
      .map((value) => value.trim())
      .filter(Boolean);
    const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
    const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));
    const resolvedVariantNames = Array.from(
      new Set([...variantNames, ...sizes]),
    );

    const input: ProductsQueryModel = {
      pagination: { page, limit },
      filters: {
        name,
        categoryId,
        category,
        genre,
        variantNames: resolvedVariantNames.length
          ? resolvedVariantNames
          : undefined,
        state,
        availability,
        minPrice,
        maxPrice,
      },
    };

    const graphqlInput = buildProductsQueryInput(
      input.filters,
      input.pagination,
    );

    const backendRes = await fetch(`${process.env.API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { input: graphqlInput },
      }),
      cache: "no-store",
    });

    const response = await backendRes.json();

    if (response.errors) {
      throw new Error(response.errors[0]?.message || "Error en GraphQL");
    }

    if (!response.data?.products) {
      throw new Error("No se recibieron productos desde GraphQL");
    }

    return NextResponse.json(
      normalizeProductsPage(response.data.products) satisfies PaginatedProducts,
    );
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String(
            (error as { message?: unknown }).message ??
              "Error al obtener productos",
          )
        : "Error al obtener productos";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
