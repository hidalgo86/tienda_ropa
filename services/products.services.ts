// services/products.services.ts
import api from "./api";
import { ProductServer } from "@/types/product.type";

/* ================================================================
   🧱 Helper para construir FormData (reutilizable)
   - variants se envía como JSON string en multipart
   - Se ignoran campos no soportados por el backend (id, file, image*, price raíz)
================================================================ */
function buildFormData(payload: ProductServer) {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    // Excluir campos que no deben enviarse al backend
    if (["id", "file", "imageUrl", "imagePublicId", "price"].includes(key))
      return;

    // Evitar null o undefined
    if (value === undefined || value === null) return;

    // variants en JSON (el backend acepta JSON en string)
    if (Array.isArray(value)) {
      if (key === "variants") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    // Objetos simples (por si acaso) -> JSON
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
================================================================ */
export async function createProduct(payload: ProductServer, file?: File) {
  const formData = buildFormData(payload);
  if (file) formData.append("file", file);

  // Debug opcional
  // for (const [key, val] of formData.entries()) console.log("📦", key, val);

  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

/* ================================================================
   ✏️ EDITAR PRODUCTO (REST + FormData)
   - PUT /products/:id
   - Campos opcionales: name, description, genre, variants (JSON string), file?
================================================================ */
export async function updateProduct(
  id: string,
  payload: ProductServer,
  file?: File
) {
  if (!id) throw new Error("ID de producto requerido");

  const formData = buildFormData(payload);
  if (file) formData.append("file", file);

  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
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
   - Body: { size, price }  (price string/number >= 0)
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
  const { data } = await api.patch(`/products/${id}/restore`, { status });
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
================================================================ */
export async function getProducts(page: number = 1, limit: number = 20) {
  const query = `
    query ($input: ProductsQueryInput) {
      products(input: $input) {
        items {
          id
          name
          description
          genre
          variants { size stock price }
          imageUrl
          status
        }
        total
        page
        totalPages
      }
    }
  `;

  const variables = { input: { pagination: { page, limit } } };
  const { data } = await api.post("/graphql", { query, variables });

  if (data.errors) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }
  return data.data.products;
}

/* ================================================================
   📦 OBTENER PRODUCTOS ADMIN (GraphQL - read only)
   - Filtros opcionales (ej: status)
================================================================ */
export async function getAdminProducts(
  page: number = 1,
  limit: number = 20,
  status?: string
) {
  const query = `
    query ($input: ProductsQueryInput) {
      adminProducts(input: $input) {
        items {
          id
          name
          description
          genre
          variants { size stock price }
          imageUrl
          status
        }
        total
        page
        totalPages
      }
    }
  `;

  const variables: any = { input: { pagination: { page, limit } } };
  if (status) {
    variables.input.filters = { ...(variables.input.filters || {}), status };
  }

  const { data } = await api.post("/graphql", { query, variables });

  if (data.errors) {
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
        status
        variants { size stock price }
        imageUrl
      }
    }
  `;

  const variables = { id };
  const { data } = await api.post("/graphql", { query, variables });

  if (data.errors) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }

  return data.data.product;
}
