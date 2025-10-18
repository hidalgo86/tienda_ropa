// Tipos de producto alineados al backend (variants con precio)

export interface ProductVariant {
  size: string; // REST usa "3M"/"2T"; GraphQL tokens se mapean por el backend
  stock: number; // entero no negativo
  price: number; // >= 0
}

export interface ProductServer {
  id: string;
  name: string;
  description?: string;
  // Nota: GraphQL devuelve enums en MAYÚSCULAS (NINA/NINO/UNISEX),
  // pero en REST se envía en minúsculas ("niña"|"niño"|"unisex").
  genre: string;
  variants?: ProductVariant[];
  imageUrl?: string;
  imagePublicId?: string;
  // GraphQL: DISPONIBLE | AGOTADO | ELIMINADO
  status?: "DISPONIBLE" | "AGOTADO" | "ELIMINADO";
  createdAt?: string;
  updatedAt?: string;
}

// Tipo de formulario/cliente (UI) para construir variants a partir de talla(s), precio y stock comunes
export interface ProductClient {
  id: string;
  name: string;
  description: string;
  genre: "niña" | "niño" | "unisex";
  variants: ProductVariant[]; // Edición directa de variantes en el formulario
  imageUrl?: string;
  imagePublicId?: string;
}

// Paginación de productos (GraphQL)
export interface PaginatedProducts {
  items: ProductServer[];
  total: number;
  page: number;
  totalPages: number;
}
