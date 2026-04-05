// app/api/products/get/route.ts
import { NextResponse } from "next/server";
import {
  Product,
  Size,
  ProductStatus,
  PaginatedProducts,
  ProductsQueryModel,
  parseGenre,
  parseProductCategory,
  parseProductStatus,
  allowedSizes,
} from "@/types/product.type";

export const dynamic = "force-dynamic";

const parseOptionalNumber = (value: string | null): number | undefined => {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const matchesFilters = (
  product: Product,
  filters: ProductsQueryModel["filters"],
): boolean => {
  if (
    filters.name &&
    !product.name.toLowerCase().includes(filters.name.toLowerCase())
  ) {
    return false;
  }

  if (filters.category && product.category !== filters.category) {
    return false;
  }

  if (filters.genre && product.genre !== filters.genre) {
    return false;
  }

  if (filters.status && product.status !== filters.status) {
    return false;
  }

  if (filters.sizes?.length) {
    const productSizes = new Set(
      (product.variants ?? []).map((variant) => variant.size),
    );
    const hasMatchingSize = filters.sizes.some((size) =>
      productSizes.has(size),
    );
    if (!hasMatchingSize) {
      return false;
    }
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const prices = (product.variants ?? []).length
      ? (product.variants ?? [])
          .map((variant) => Number(variant.price))
          .filter((price) => Number.isFinite(price))
      : [Number(product.price)].filter((price) => Number.isFinite(price));

    if (!prices.length) {
      return false;
    }

    const hasMatchingPrice = prices.some((price) => {
      if (filters.minPrice !== undefined && price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && price > filters.maxPrice) {
        return false;
      }
      return true;
    });

    if (!hasMatchingPrice) {
      return false;
    }
  }

  return true;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // ===== Paginación =====
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    // ===== Filtros =====
    const name = searchParams.get("name") || undefined;
    const category =
      parseProductCategory(searchParams.get("category")) ?? undefined;
    const genre = parseGenre(searchParams.get("genre")) ?? undefined;
    const status =
      parseProductStatus(searchParams.get("status")) ||
      ProductStatus.DISPONIBLE;
    const sizes = searchParams
      .getAll("size")
      .map((s) => String(s).trim().toUpperCase() as Size)
      .filter((s): s is Size => allowedSizes.has(s));
    const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
    const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));

    // ===== Mapear a DTO de NestJS =====
    const input: ProductsQueryModel = {
      pagination: { page, limit },
      filters: {
        name,
        category,
        genre,
        status,
        sizes: sizes.length ? sizes : undefined,
        minPrice,
        maxPrice,
      },
    };

    // ===== Query GraphQL =====
    const query = `
      query Products($input: ProductsQueryInput!) {
        products(input: $input) {
          items {
            id
            name
            description
            category
            genre
            status
            images {
              url
              publicId
            }
            variants {
              size
              stock
              price
            }
            stock
            price
          }
          total
          page
          totalPages
        }
      }
    `;

    const fetchProductsPage = async (pageNumber: number, pageSize: number) => {
      const backendRes = await fetch(`${process.env.API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              pagination: { page: pageNumber, limit: pageSize },
              filters: input.filters,
            },
          },
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

      return response.data.products as PaginatedProducts;
    };

    const needsExactFiltering = Boolean(
      name ||
      category ||
      genre ||
      sizes.length ||
      minPrice !== undefined ||
      maxPrice !== undefined,
    );

    if (needsExactFiltering) {
      const batchLimit = Math.max(limit, 100);
      const firstBatch = await fetchProductsPage(1, batchLimit);
      const allItems = [...firstBatch.items];

      for (
        let currentPage = 2;
        currentPage <= firstBatch.totalPages;
        currentPage += 1
      ) {
        const batch = await fetchProductsPage(currentPage, batchLimit);
        allItems.push(...batch.items);
      }

      const filteredItems = allItems.filter((product) =>
        matchesFilters(product, input.filters),
      );
      const total = filteredItems.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const startIndex = (page - 1) * limit;
      const pageItems = filteredItems.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        items: pageItems,
        total,
        page,
        totalPages,
      } satisfies PaginatedProducts);
    }

    const data = await fetchProductsPage(page, limit);

    return NextResponse.json(data);
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
