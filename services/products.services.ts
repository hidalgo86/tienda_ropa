// services/products.services.ts
import api from "./api";
import { ProductServer } from "@/types/product.type";

/* ================================================================
   🛡️ VALIDACIONES Y UTILIDADES
================================================================ */

// Función para traducir género del backend al español
function translateGenre(genre: string): string {
  const translations: { [key: string]: string } = {
    NINO: "niño",
    NINA: "niña",
    UNISEX: "unisex",
  };
  return translations[genre?.toUpperCase()] || genre?.toLowerCase() || "";
}

// Función para transformar productos con género traducido
function transformProductsWithTranslatedGenre(
  products: ProductServer[]
): ProductServer[] {
  return products.map((product) => ({
    ...product,
    genre: translateGenre(product.genre),
  }));
}

// Función para transformar un solo producto con género traducido
function transformProductWithTranslatedGenre(
  product: ProductServer
): ProductServer {
  return {
    ...product,
    genre: translateGenre(product.genre),
  };
}

// Normaliza talla a formato backend (acepta 3M/M3 y 2T/T2 pero convierte al formato del backend)
function canonicalizeSize(raw: string): string {
  const s = String(raw || "")
    .trim()
    .toUpperCase();
  if (s === "RN") return "RN";

  // 3M o M3 -> 3M (formato backend)
  const m1 = /^(\d+)M$/.exec(s);
  if (m1) return `${m1[1]}M`;
  const m2 = /^M(\d+)$/.exec(s);
  if (m2) return `${m2[1]}M`;

  // 2T o T2 -> 2T (formato backend)
  const t1 = /^(\d+)T$/.exec(s);
  if (t1) return `${t1[1]}T`;
  const t2 = /^T(\d+)$/.exec(s);
  if (t2) return `${t2[1]}T`;

  return s;
}

// Tallas válidas según el enum Size del backend
const VALID_SIZES = [
  "RN",
  "3M",
  "6M",
  "9M",
  "12M",
  "18M",
  "24M",
  "2T",
  "3T",
  "4T",
  "5T",
  "6T",
  "7T",
  "8T",
  "9T",
  "10T",
  "12T",
];

function validateVariants(variants: any[]): string[] {
  const errors: string[] = [];

  if (!Array.isArray(variants) || variants.length === 0) {
    errors.push("Se requiere al menos un variant");
    return errors;
  }

  variants.forEach((variant, index) => {
    const { size, stock, price } = variant;

    // Validar talla
    if (!size || !VALID_SIZES.includes(size)) {
      errors.push(
        `Variant ${
          index + 1
        }: Talla "${size}" no válida. Usar: ${VALID_SIZES.join(", ")}`
      );
    }

    // Validar stock
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      errors.push(`Variant ${index + 1}: Stock debe ser un número >= 0`);
    }

    // Validar precio
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.push(`Variant ${index + 1}: Precio debe ser un número >= 0`);
    }
  });

  return errors;
}

function calculateStatusFromVariants(
  variants: any[]
): "disponible" | "agotado" {
  const totalStock = variants.reduce(
    (acc, v) => acc + (Number(v.stock) || 0),
    0
  );
  return totalStock > 0 ? "disponible" : "agotado";
}

/* ================================================================
   🧱 Helper para construir FormData (reutilizable)
   - variants se envía como JSON string en multipart
   - Se ignoran campos no soportados por el backend (id, file, image*, price/size/stock raíz)
================================================================ */
function buildFormData(payload: ProductServer, isUpdate = false) {
  const formData = new FormData();

  console.log("🔧 buildFormData called with isUpdate:", isUpdate);
  console.log("🔧 payload keys:", Object.keys(payload || {}));

  Object.entries(payload || {}).forEach(([key, value]) => {
    console.log(`🔧 Processing key: ${key}, isUpdate: ${isUpdate}`);

    // Excluir campos que no deben enviarse al backend
    const excludedFields = [
      "id",
      "file",
      "imageUrl",
      "imagePublicId",
      "price", // ya no existe a nivel raíz
      "size", // legacy UI
      "stock", // legacy UI
    ];

    if (excludedFields.includes(key)) {
      console.log(`🔧 Excluding field: ${key}`);
      return;
    }

    if (value === undefined || value === null) {
      console.log(`🔧 Skipping null/undefined field: ${key}`);
      return;
    }

    // variants en JSON string - formatear según backend expectativa
    if (key === "variants" && Array.isArray(value)) {
      // Convertir a formato esperado por backend: stock y price como strings
      const formattedVariants = value.map((variant: any) => ({
        size: variant.size, // el size ya debe estar en formato backend (3M, 6M, etc.)
        stock: String(variant.stock || 0), // convertir a string
        price: String(variant.price || 0), // convertir a string
      }));
      formData.append(key, JSON.stringify(formattedVariants));
      console.log("🔧 Variants formateados para backend:", formattedVariants);
      return;
    }

    // Objetos -> JSON
    if (typeof value === "object") {
      console.log(`🔧 Appending object field: ${key}`);
      formData.append(key, JSON.stringify(value));
      return;
    }

    console.log(`🔧 Appending field: ${key} = ${value}`);
    formData.append(key, value as any);
  });

  console.log("🔧 Final FormData entries:", Array.from(formData.entries()));
  return formData;
}

/* ================================================================
   🚀 CREAR PRODUCTO (REST + FormData)
   - Campos: name, description?, genre, variants (JSON string), file?
   - Incluye validaciones antes del envío
================================================================ */
export async function createProduct(payload: ProductServer, file?: File) {
  // Validar variants antes del envío
  if (payload.variants) {
    const validationErrors = validateVariants(payload.variants);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación:\n${validationErrors.join("\n")}`);
    }
  }

  const formData = buildFormData(payload, false); // false = create mode
  if (file) formData.append("file", file);

  console.log("🔧 FormData para create:", Array.from(formData.entries()));

  try {
    const { data } = await api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  } catch (error: any) {
    // Mejorar manejo de errores del servidor
    if (error.response?.status === 400) {
      const serverError =
        error.response.data?.message || error.response.data?.error;
      throw new Error(`Error de validación del servidor: ${serverError}`);
    }
    throw error;
  }
}

/* ================================================================
   ✏️ EDITAR PRODUCTO (REST)
   - Usa PATCH /products/:id para actualización unificada
   - Solo usa FormData si hay un archivo NUEVO, sino usa JSON
================================================================ */
export async function updateProduct(
  id: string,
  payload: ProductServer,
  file?: File
) {
  if (!id) throw new Error("ID de producto requerido");

  console.log("🔧 UpdateProduct payload completo:", payload);
  console.log("🔧 Payload keys:", Object.keys(payload));
  console.log("🔧 ¿Hay archivo NUEVO?", !!file);

  try {
    // Validación previa de variants para ambos casos
    if (payload.variants && payload.variants.length > 0) {
      console.log("🔧 Validando variants antes del envío");

      payload.variants.forEach((variant, index) => {
        if (!variant.size) {
          throw new Error(`Variant ${index + 1}: size es requerido`);
        }
        if (variant.stock !== undefined && isNaN(Number(variant.stock))) {
          throw new Error(`Variant ${index + 1}: stock debe ser numérico`);
        }
        if (variant.price !== undefined && isNaN(Number(variant.price))) {
          throw new Error(`Variant ${index + 1}: price debe ser numérico`);
        }
      });
      console.log("✅ Variants validados correctamente");
    }

    if (file) {
      // Con archivo: usar FormData
      console.log("🔧 Usando FormData (con archivo)");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", payload.name);
      formData.append("description", payload.description || "");
      formData.append("genre", payload.genre);

      // Formatear variants exactamente como espera el backend
      const variantsForBackend = payload.variants?.map((v) => ({
        size: v.size, // debe coincidir con enum Size
        stock: String(v.stock || 0), // string, validación /^\d+$/
        price: String(v.price || 0), // string, validación hasta 2 decimales
      }));

      formData.append("variants", JSON.stringify(variantsForBackend));

      console.log("🔧 FormData keys:", Array.from(formData.keys()));
      console.log("🔧 Variants para backend:", variantsForBackend);

      const { data } = await api.patch(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Producto actualizado con FormData");
      return data;
    } else {
      // Sin archivo: usar JSON
      console.log("🔧 Usando JSON (sin archivo)");

      const jsonPayload = {
        name: payload.name,
        description: payload.description,
        genre: payload.genre,
        variants: payload.variants?.map((variant) => ({
          size: variant.size,
          stock: String(variant.stock || 0),
          price: String(variant.price || 0),
        })),
      };

      console.log("🔧 JSON payload:", jsonPayload);

      const { data } = await api.patch(`/products/${id}`, jsonPayload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Producto actualizado con JSON");
      return data;
    }
  } catch (error: any) {
    console.error("❌ Error completo:", error.response?.data);
    console.error("❌ Error config:", error.config);
    console.error("❌ Request URL:", error.config?.url);
    console.error("❌ Request method:", error.config?.method);

    const errorMessage = error.response?.data?.message || error.message;

    if (Array.isArray(errorMessage)) {
      throw new Error(
        `Error de validación del servidor: ${JSON.stringify(errorMessage)}`
      );
    } else {
      throw new Error(`Error del servidor: ${errorMessage}`);
    }
  }
}

/* ================================================================
   🗑️ SOFT DELETE (REST)
   - DELETE /products/:id
================================================================ */
export async function softDeleteProduct(id: string) {
  if (!id) throw new Error("ID de producto requerido");
  const { data } = await api.delete(`/products/${id}`);
  return data;
}

/* ================================================================
   ♻️ RESTAURAR PRODUCTO (REST)
   - PATCH /products/:id/restore  Body: { status: 'disponible' | 'agotado' }
================================================================ */
export async function restoreProduct(id: string, status: string) {
  if (!id) throw new Error("ID de producto requerido");
  const lower = String(status).toLowerCase();
  if (!["disponible", "agotado"].includes(lower)) {
    throw new Error("Estado inválido para restauración");
  }
  const { data } = await api.patch(`/products/${id}/restore`, {
    status: lower,
  });
  return data;
}

/* ================================================================
   🗑️ Borrado fuerte (REST)
   - DELETE /products/:id/hard
================================================================ */
export async function hardDeleteProduct(id: string) {
  if (!id) throw new Error("ID de producto requerido");
  const { data } = await api.delete(`/products/${id}/hard`);
  return data;
}

/* ================================================================
   📦 OBTENER PRODUCTOS (GraphQL - read only)
   - Retorna variants { size, stock, price }
   - Ordenamiento y filtros disponibles
================================================================ */
export async function getProducts(
  page: number = 1,
  limit: number = 20,
  sort?:
    | "PRICE_MIN_ASC"
    | "PRICE_MIN_DESC"
    | "STOCK_TOTAL_ASC"
    | "STOCK_TOTAL_DESC"
    | "NAME_ASC"
    | "NAME_DESC"
    | "CREATED_AT_ASC"
    | "CREATED_AT_DESC",
  search?: string,
  genre?: string,
  minPrice?: number,
  maxPrice?: number,
  size?: string
) {
  const query = `
    query ($input: ProductsQueryInput) {
      products(input: $input) {
        items {
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
        total
        page
        totalPages
      }
    }
  `;

  // Construir filtros dinámicamente
  const filters: any = {};
  if (search) filters.name = search;
  // Mapeo seguro de género: español → backend
  const genreMap: Record<string, string> = {
    niño: "NINO",
    nino: "NINO",
    niña: "NINA",
    nina: "NINA",
    unisex: "UNISEX",
    NINO: "NINO",
    NINA: "NINA",
    UNISEX: "UNISEX",
  };
  if (genre) {
    const normalized = String(genre).trim().toLowerCase();
    filters.genre = genreMap[normalized] || genre.toUpperCase();
  }
  if (typeof minPrice === "number" && !isNaN(minPrice)) {
    filters.minPrice = minPrice;
  }
  if (typeof maxPrice === "number" && !isNaN(maxPrice)) {
    filters.maxPrice = maxPrice;
  }

  const variables: any = {
    input: {
      pagination: { page, limit },
      ...(sort && { sort }),
      ...(Object.keys(filters).length > 0 && { filters }),
    },
  };

  const { data } = await api.post("/graphql", { query, variables });

  if (data?.errors?.length) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }

  // Transformar productos con género traducido
  const result = data.data.products;
  if (result?.items) {
    result.items = transformProductsWithTranslatedGenre(result.items);
  }

  return result;
}

/* ================================================================
   📦 OBTENER PRODUCTOS ADMIN (GraphQL - read only)
   - Filtros avanzados: status, genre, sizes
   - Ordenamiento: precio, stock, nombre, fecha
================================================================ */
export async function getAdminProducts(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    genre?: string;
    sizes?: string[];
  },
  sort?:
    | "PRICE_MIN_ASC"
    | "PRICE_MIN_DESC"
    | "STOCK_TOTAL_ASC"
    | "STOCK_TOTAL_DESC"
    | "NAME_ASC"
    | "NAME_DESC"
    | "CREATED_AT_ASC"
    | "CREATED_AT_DESC"
) {
  const query = `
    query ($input: ProductsQueryInput) {
      adminProducts(input: $input) {
        items {
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
        total
        page
        totalPages
      }
    }
  `;

  const variables: any = {
    input: {
      pagination: { page, limit },
      ...(sort && { sort }),
      ...(filters && {
        filters: {
          ...(filters.status && {
            status: String(filters.status).toUpperCase(),
          }),
          ...(filters.genre && { genre: String(filters.genre).toUpperCase() }),
          ...(filters.sizes && { sizes: filters.sizes }),
        },
      }),
    },
  };

  const { data } = await api.post("/graphql", { query, variables });

  if (data?.errors?.length) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }

  // Transformar productos con género traducido
  const result = data.data.adminProducts;
  if (result?.items) {
    result.items = transformProductsWithTranslatedGenre(result.items);
  }

  return result;
}

/* ================================================================
   🔍 OBTENER PRODUCTO POR ID (GraphQL - read only)
================================================================ */
export async function getProductoById(id: string) {
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
  const { data } = await api.post("/graphql", { query, variables });

  if (data?.errors?.length) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }

  // Transformar producto con género traducido
  const product = data.data.product;
  return product ? transformProductWithTranslatedGenre(product) : null;
}

/* ================================================================
   🔧 UTILIDADES EXPORTADAS
================================================================ */
export {
  VALID_SIZES,
  validateVariants,
  calculateStatusFromVariants,
  translateGenre,
  transformProductsWithTranslatedGenre,
  transformProductWithTranslatedGenre,
  canonicalizeSize,
};
