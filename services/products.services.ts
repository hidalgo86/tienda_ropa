// services/products.services.ts
import api from "./api";
import { ProductServer } from "@/types/product.type";

/* ================================================================
   🛡️ VALIDACIONES Y UTILIDADES
================================================================ */

// Tallas válidas según el test de integración
const VALID_SIZES = [
  "RN",
  "0-3M",
  "3M",
  "3-6M",
  "6M",
  "6-9M",
  "9M",
  "9-12M",
  "12M",
  "18M",
  "24M",
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

  Object.entries(payload || {}).forEach(([key, value]) => {
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

    // Para updates, excluir variants para evitar conflictos de validación DTO
    if (isUpdate && key === "variants") {
      console.log(
        "🔧 Skipping variants in update mode to avoid DTO validation conflict"
      );
      return;
    }

    if (excludedFields.includes(key)) {
      return;
    }

    if (value === undefined || value === null) return;

    // variants en JSON string - formatear según backend expectativa
    if (key === "variants" && Array.isArray(value)) {
      // Convertir a formato esperado por backend: stock y price como strings
      const formattedVariants = value.map((variant: any) => ({
        size: variant.size, // mantenemos como está (enum)
        stock: String(variant.stock || 0), // convertir a string
        price: String(variant.price || 0), // convertir a string
      }));
      formData.append(key, JSON.stringify(formattedVariants));
      console.log("🔧 Variants formateados para backend:", formattedVariants);
      return;
    }

    // Objetos -> JSON
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value as any);
  });

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
   ✏️ EDITAR PRODUCTO (REST + FormData)
   - PUT /products/:id
   - Campos opcionales: name, description, genre, variants (JSON string), file?
   - Auto-actualiza status basado en stock total
================================================================ */
export async function updateProduct(
  id: string,
  payload: ProductServer,
  file?: File
) {
  if (!id) throw new Error("ID de producto requerido");

  console.log("🔧 UpdateProduct payload completo:", payload);
  console.log("🔧 Payload keys:", Object.keys(payload));

  // Validar variants antes del envío
  if (payload.variants) {
    const validationErrors = validateVariants(payload.variants);
    if (validationErrors.length > 0) {
      throw new Error(`Errores de validación:\n${validationErrors.join("\n")}`);
    }
  }

  try {
    let result: any;

    // 1. Actualizar detalles básicos sin variants
    const formData = buildFormData(payload, true); // true = update mode (excluye variants)
    if (file) formData.append("file", file);

    console.log(
      "🔧 FormData para update (sin variants):",
      Array.from(formData.entries())
    );

    // Hacer PUT con FormData sin variants
    const { data } = await api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    result = data;

    // 2. Si hay variants, actualizarlas por separado usando endpoint específico
    if (payload.variants && payload.variants.length > 0) {
      console.log("🔧 Actualizando variants separadamente:", payload.variants);

      const variantsOnly = new FormData();
      const formattedVariants = payload.variants.map((variant: any) => ({
        size: variant.size,
        stock: String(variant.stock || 0),
        price: String(variant.price || 0),
      }));
      variantsOnly.append("variants", JSON.stringify(formattedVariants));

      console.log("🔧 Enviando variants:", formattedVariants);

      // Segundo PUT solo con variants
      const { data: variantsData } = await api.put(
        `/products/${id}`,
        variantsOnly,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      result = variantsData;
      console.log("✅ Variants actualizados");
    }

    return result;
  } catch (error: any) {
    console.error("❌ Error completo:", error.response?.data);
    console.error("❌ Error config:", error.config);
    console.error("❌ Request URL:", error.config?.url);
    console.error("❌ Request method:", error.config?.method);
    console.error("❌ Request data enviada:", error.config?.data);
    console.error("❌ Request headers:", error.config?.headers);

    if (error.response?.status === 400) {
      const serverError =
        error.response.data?.message || error.response.data?.error;
      throw new Error(
        `Error de validación del servidor: ${JSON.stringify(serverError)}`
      );
    }
    throw error;
  }
}

/* ================================================================
   🔧 Ajustar stock por talla (REST)
   - PATCH /products/:id/variants
   - Body: { size, stock } | { size, stockDelta }
================================================================ */
export async function adjustVariantStock(
  id: string,
  body: { size: string; stock?: number; stockDelta?: number }
) {
  if (!id) throw new Error("ID de producto requerido");
  const { data } = await api.patch(`/products/${id}/variants`, body);
  return data;
}

/* ================================================================
   💲 Actualizar precio por talla (REST)
   - PATCH /products/:id/variants/price
   - Body: { size, price } (>= 0)
================================================================ */
export async function updateVariantPrice(
  id: string,
  body: { size: string; price: string | number }
) {
  if (!id) throw new Error("ID de producto requerido");
  const { data } = await api.patch(`/products/${id}/variants/price`, body);
  return data;
}

/* ================================================================
   📝 Actualizar datos generales (REST)
   - PATCH /products/:id/details
   - Body: { name?, description?, genre?, status? }
================================================================ */
export async function updateProductDetails(
  id: string,
  details: {
    name?: string;
    description?: string;
    genre?: string;
    status?: string;
  }
) {
  if (!id) throw new Error("ID de producto requerido");
  const { data } = await api.patch(`/products/${id}/details`, details);
  return data;
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
    | "CREATED_AT_DESC"
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

  const variables: any = {
    input: {
      pagination: { page, limit },
      ...(sort && { sort }),
    },
  };

  const { data } = await api.post("/graphql", { query, variables });

  if (data?.errors?.length) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }
  return data.data.products;
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
  return data.data.adminProducts;
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

  return data.data.product;
}

/* ================================================================
   🔧 UTILIDADES EXPORTADAS
================================================================ */
export { VALID_SIZES, validateVariants, calculateStatusFromVariants };
