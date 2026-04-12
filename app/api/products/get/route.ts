// app/api/products/get/route.ts
import { NextResponse } from "next/server";
import {
  ProductAvailability,
  ProductAvailabilityFilter,
  Product,
  ProductState,
  ProductStatus,
  PaginatedProducts,
  ProductsQueryModel,
  Size,
  getProductStatus,
  parseGenre,
  parseProductAvailabilityFilter,
  parseProductState,
  parseProductStatus,
  allowedSizes,
} from "@/types/product.type";
import { normalizeProductsPage } from "../normalizeProduct";

export const dynamic = "force-dynamic";

const parseOptionalNumber = (value: string | null): number | undefined => {
  if (value === null || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toGraphqlAvailability = (
  availability?: ProductAvailabilityFilter,
): "DISPONIBLE" | "AGOTADO" | undefined => {
  if (!availability) return undefined;

  if (availability === ProductAvailability.DISPONIBLE) {
    return "DISPONIBLE";
  }

  if (availability === ProductAvailability.AGOTADO) {
    return "AGOTADO";
  }

  return undefined;
};

const toGraphqlState = (
  state?: ProductState,
): "ACTIVO" | "ELIMINADO" | undefined => {
  if (!state) return undefined;
  return state === ProductState.ACTIVO ? "ACTIVO" : "ELIMINADO";
};

const toGraphqlGenre = (
  genre?: ProductsQueryModel["filters"]["genre"],
): "NINA" | "NINO" | "UNISEX" | undefined => {
  if (!genre) return undefined;

  if (genre === "niña") {
    return "NINA";
  }

  if (genre === "niño") {
    return "NINO";
  }

  return "UNISEX";
};

const matchesFilters = (
  product: Product,
  filters: ProductsQueryModel["filters"],
): boolean => {
  if (filters.categoryId && product.categoryId !== filters.categoryId) {
    return false;
  }

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

  if (filters.status && getProductStatus(product) !== filters.status) {
    return false;
  }

  if (filters.state && product.state !== filters.state) {
    return false;
  }

  if (filters.availability) {
    if (filters.availability === "eliminado") {
      if (product.state !== "eliminado") {
        return false;
      }
    } else if (product.availability !== filters.availability) {
      return false;
    }
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

  if (filters.variantNames?.length) {
    const productVariantNames = new Set(
      (product.variants ?? []).map((variant) => variant.name),
    );
    const hasMatchingVariant = filters.variantNames.some((variantName) =>
      productVariantNames.has(variantName),
    );
    if (!hasMatchingVariant) {
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
    const categoryId = searchParams.get("categoryId")?.trim() || undefined;
    const category = searchParams.get("category")?.trim() || undefined;
    const genre = parseGenre(searchParams.get("genre")) ?? undefined;
    const status = parseProductStatus(searchParams.get("status")) ?? undefined;
    const state = parseProductState(searchParams.get("state")) ?? undefined;
    const availability =
      parseProductAvailabilityFilter(searchParams.get("availability")) ??
      undefined;
    const sizes = searchParams
      .getAll("size")
      .map((s) => String(s).trim().toUpperCase())
      .filter((s): s is Size => allowedSizes.has(s as Size));
    const variantNames = searchParams
      .getAll("variantName")
      .map((value) => value.trim())
      .filter(Boolean);
    const minPrice = parseOptionalNumber(searchParams.get("minPrice"));
    const maxPrice = parseOptionalNumber(searchParams.get("maxPrice"));

    const fallbackAvailability: ProductAvailabilityFilter | undefined =
      status === ProductStatus.DISPONIBLE
        ? ProductAvailability.DISPONIBLE
        : status === ProductStatus.AGOTADO
          ? ProductAvailability.AGOTADO
          : undefined;

    const fallbackState: ProductState | undefined =
      status === ProductStatus.ELIMINADO ? ProductState.ELIMINADO : undefined;

    const resolvedState =
      state ??
      (availability === ProductState.ELIMINADO
        ? ProductState.ELIMINADO
        : fallbackState);

    const resolvedAvailability =
      availability === ProductState.ELIMINADO
        ? undefined
        : (availability ?? fallbackAvailability);

    // ===== Mapear a DTO de NestJS =====
    const input: ProductsQueryModel = {
      pagination: { page, limit },
      filters: {
        name,
        categoryId,
        category,
        genre,
        variantNames: variantNames.length ? variantNames : undefined,
        status,
        state: resolvedState,
        availability: resolvedAvailability,
        sizes: sizes.length ? sizes : undefined,
        minPrice,
        maxPrice,
      },
    };

    const graphqlInput = {
      pagination: input.pagination,
      filters: {
        name: input.filters.name,
        categoryId: input.filters.categoryId,
        genre: toGraphqlGenre(input.filters.genre),
        variantNames: input.filters.variantNames,
        minPrice: input.filters.minPrice,
        maxPrice: input.filters.maxPrice,
        state: toGraphqlState(input.filters.state),
        availability: toGraphqlAvailability(input.filters.availability),
      },
    };

    // ===== Query GraphQL =====
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

    const fetchProductsPage = async (pageNumber: number, pageSize: number) => {
      const backendRes = await fetch(`${process.env.API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              ...graphqlInput,
              pagination: {
                ...graphqlInput.pagination,
                page: pageNumber,
                limit: pageSize,
              },
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

      return normalizeProductsPage(response.data.products);
    };

    const needsExactFiltering = Boolean(
      name ||
      categoryId ||
      category ||
      genre ||
      variantNames.length ||
      sizes.length ||
      status ||
      state ||
      availability ||
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

    return NextResponse.json(normalizeProductsPage(data));
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
