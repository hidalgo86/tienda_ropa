import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product, findVariantBySelection } from "@/types/domain/products";

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

const GUEST_CART_KEY = "guestCart";
const AUTH_TOKEN_KEY = "authToken";

const hasActiveSession = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
};

export const calculateCartTotals = (items: CartItem[]) => {
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = safeItems.reduce((total, item) => {
    const variantPrice = findVariantBySelection(
      item.variants,
      item.selectedSize,
    )?.price;
    const price = Number(variantPrice ?? item.price ?? 0);
    return total + Number(price) * item.quantity;
  }, 0);

  return { totalItems, totalPrice };
};

export const getGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = window.localStorage.getItem(GUEST_CART_KEY);
    return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
  } catch (error) {
    console.error("Error loading guest cart from localStorage:", error);
    return [];
  }
};

export const setGuestCart = (cartItems: CartItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving guest cart to localStorage:", error);
  }
};

export const clearGuestCart = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_KEY);
};

const persistGuestCart = (items: CartItem[]): void => {
  if (hasActiveSession()) return;
  setGuestCart(items);
};

const initialCartItems = getGuestCart();
const initialTotals = calculateCartTotals(initialCartItems);

const initialState: CartState = {
  items: initialCartItems,
  totalItems: initialTotals.totalItems,
  totalPrice: initialTotals.totalPrice,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity?: number;
        selectedSize?: string;
        selectedColor?: string;
      }>,
    ) => {
      const {
        product,
        quantity = 1,
        selectedSize,
        selectedColor,
      } = action.payload;

      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor,
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({
          ...product,
          quantity,
          selectedSize,
          selectedColor,
        });
      }

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      persistGuestCart(state.items);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{
        productId: string;
        selectedSize?: string;
        selectedColor?: string;
      }>,
    ) => {
      const { productId, selectedSize, selectedColor } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          ),
      );

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      persistGuestCart(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
        selectedSize?: string;
        selectedColor?: string;
      }>,
    ) => {
      const { productId, quantity, selectedSize, selectedColor } =
        action.payload;

      const itemIndex = state.items.findIndex(
        (item) =>
          item.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor,
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
      }

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      persistGuestCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      persistGuestCart(state.items);
    },

    syncCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, syncCart } =
  cartSlice.actions;

export default cartSlice.reducer;
