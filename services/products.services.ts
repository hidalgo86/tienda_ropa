// services/products.services.ts
import api from "./api";
import { ProductServer } from "@/types/product.type";

/* ================================================================
   🧱 Helper para construir FormData (reutilizable)
================================================================ */
function buildFormData(payload: ProductServer) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    // Excluir campos que no deben enviarse al backend
    if (["id", "file", "imageUrl", "imagePublicId"].includes(key)) return;

    // Evitar null o undefined
    if (value === undefined || value === null) return;

    // Manejo especial de 'size': backend espera CSV ("RN,3M,6M") NO JSON
    if (Array.isArray(value)) {
      if (key === "size") {
        const csv = value.filter(Boolean).join(",");
        formData.append(key, csv);
      } else {
        formData.append(key, JSON.stringify(value));
      }
      return;
    }

    formData.append(key, value as any);
  });

  return formData;
}

/* ================================================================
   🚀 CREAR PRODUCTO (REST + FormData)
================================================================ */
export async function createProduct(payload: ProductServer, file?: File) {
  console.log("payload", payload);
  const formData = buildFormData(payload);

  // Adjuntar archivo solo si existe
  if (file) formData.append("file", file);

  // 🔍 Debug (solo para desarrollo)
  for (const [key, val] of formData.entries()) {
    console.log("📦", key, val);
  }

  // console.log("🚀 Creando producto...", formData);

  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

/* ================================================================
   ✏️ EDITAR PRODUCTO (REST + FormData)
================================================================ */
export async function updateProduct(
  id: string,
  payload: ProductServer,
  file?: File
) {
  if (!id) throw new Error("ID de producto requerido");

  const formData = buildFormData(payload);
  if (file) formData.append("file", file);

  for (const [key, val] of formData.entries()) {
    console.log("✏️", key, val);
  }

  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

/* ================================================================
   🗑️ SOFT DELETE (GraphQL)
================================================================ */
export async function softDeleteProduct(id: string) {
  const query = `
    mutation ($id: String!) {
      softDeleteProduct(id: $id) {
        id
        name
        status
      }
    }
  `;

  const variables = { id };
  const { data } = await api.post("/graphql", { query, variables });

  if (data.errors) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }

  return data.data.softDeleteProduct;
}

/* ================================================================
   ♻️ RESTAURAR PRODUCTO (GraphQL)
   Restaura un producto previamente eliminado y le asigna un nuevo status
   según lo que se determine en el cliente (DISPONIBLE | AGOTADO).
   Si el nombre de la mutación en tu backend difiere (por ejemplo
   restoreProductStatus o updateProductStatus) ajusta el string `query`.
================================================================ */
export async function restoreProduct(id: string, status: string) {
  const query = `
    mutation ($id: String!, $status: String!) {
      restoreProduct(id: $id, status: $status) { id }
    }
  `;

  const variables = { id, status };
  const { data } = await api.post("/graphql", { query, variables });

  if (data.errors) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }

  // Intentamos obtener el status actualizado con una consulta si es necesario
  try {
    const refreshed = await getProductoById(id);
    return refreshed;
  } catch {
    return data.data.restoreProduct;
  }
}

/* ================================================================
   📦 OBTENER PRODUCTOS (GraphQL)
================================================================ */
export async function getProducts(page: number = 1, limit: number = 20) {
  const query = `
    query ($input: ProductsQueryInput) {
      products(input: $input) {
        items {
          id
          name
          description
          price
          stock
          size
          genre
          imageUrl
          status
        }
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
   📦 OBTENER PRODUCTOS ADMIN (GraphQL)
================================================================ */
export async function getAdminProducts(
  page: number = 1,
  limit: number = 20,
  status: string = "DISPONIBLE"
) {
  const query = `
    query ($input: ProductsQueryInput) {
      adminProducts(input: $input) {
        items {
          id
          name
          description
          price
          stock
          size
          genre
          imageUrl
          status
        }
        totalPages
      }
    }
  `;

  const variables = {
    input: { pagination: { page, limit }, filters: { status } },
  };
  const { data } = await api.post("/graphql", { query, variables });

  if (data.errors) {
    throw new Error(data.errors.map((e: any) => e.message).join(", "));
  }
  return data.data.adminProducts;
}

/* ================================================================
   🔍 OBTENER PRODUCTO POR ID (GraphQL)
================================================================ */
export async function getProductoById(id: string) {
  const query = `
    query ($id: String!) {
      product(id: $id) {
        id
        name
        description
        price
        stock
        size
        genre
        imageUrl
        status
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
