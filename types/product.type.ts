// Define  Product
export interface ProductServer {
  id: string;
  name: string;
  description?: string;
  genre: "niña" | "niño" | "unisex";
  size: string[];
  price: number;
  stock: number;
  imageUrl?: string;
  imagePublicId?: string;
  status?: "DISPONIBLE" | "AGOTADO" | "ELIMINADO";
}

export interface ProductClient {
  id: string;
  name: string;
  description: string;
  genre: string;
  size: string;
  price: number;
  stock: number;
  imageUrl?: string;
  imagePublicId?: string;
  status?: "DISPONIBLE" | "AGOTADO" | "ELIMINADO";
}

// Define PaginatedProducts
export interface PaginatedProducts {
  items: ProductServer[];
  total: number;
  page: number;
  totalPages: number;
}
