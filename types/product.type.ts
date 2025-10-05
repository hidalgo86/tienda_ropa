// Define  Product
export interface ProductServer {
  id: string;
  name: string;
  description?: string;
  genre: "NINA" | "NINO" | "UNISEX";
  size: string[];
  price: number;
  stock: number;
  imageUrl?: string;
  imagePublicId?: string;
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
}

// Define PaginatedProducts
export interface PaginatedProducts {
  items: ProductServer[];
  total: number;
  page: number;
  totalPages: number;
}

