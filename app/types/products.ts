export interface Product {
  id: string;
  name: string;
  description?: string;
  genre: "niña" | "niño" | "unisex";
  size: string[];
  price: number;
  stock: number;
  imageUrl?: string;
  imagePublicId?: string;
}

