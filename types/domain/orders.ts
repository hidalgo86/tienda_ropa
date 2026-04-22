export interface OrderItem {
  productId: string;
  variantName?: string | null;
  quantity: number;
  productName: string;
  thumbnail?: string | null;
  unitPrice: number;
  lineTotal: number;
}

export interface ShippingAddress {
  address: string;
  name?: string | null;
  phone?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    status: string;
    role: string;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: string;
  paymentMethod: string;
  paymentReference?: string | null;
  paidAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
