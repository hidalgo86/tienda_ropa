import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductServer } from "@/types/product.type";

interface CartItem extends ProductServer {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Función para cargar carrito desde localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

// Función para guardar carrito en localStorage
const saveCartToStorage = (cartItems: CartItem[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Función para calcular totales
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    const price = Array.isArray(item.variants)
      ? item.variants.find((v) => v.size === item.selectedSize)?.price || 0
      : 0;
    return total + Number(price) * item.quantity;
  }, 0);

  return { totalItems, totalPrice };
};

const initialCartItems = loadCartFromStorage();
const { totalItems, totalPrice } = calculateTotals(initialCartItems);

const initialState: CartState = {
  items: initialCartItems,
  totalItems,
  totalPrice,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        product: ProductServer;
        quantity?: number;
        selectedSize?: string;
        selectedColor?: string;
      }>
    ) => {
      const {
        product,
        quantity = 1,
        selectedSize,
        selectedColor,
      } = action.payload;

      // Buscar si el producto ya existe con las mismas características
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingItemIndex >= 0) {
        // Si existe, aumentar la cantidad
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Si no existe, agregar nuevo item
        const newItem: CartItem = {
          ...product,
          quantity,
          selectedSize,
          selectedColor,
        };
        state.items.push(newItem);
      }

      // Recalcular totales
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      // Guardar en localStorage
      saveCartToStorage(state.items);
    },

    removeFromCart: (
      state,
      action: PayloadAction<{
        productId: string;
        selectedSize?: string;
        selectedColor?: string;
      }>
    ) => {
      const { productId, selectedSize, selectedColor } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      );

      // Recalcular totales
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      // Guardar en localStorage
      saveCartToStorage(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
        selectedSize?: string;
        selectedColor?: string;
      }>
    ) => {
      const { productId, quantity, selectedSize, selectedColor } =
        action.payload;

      const itemIndex = state.items.findIndex(
        (item) =>
          item.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Si la cantidad es 0 o menos, remover el item
          state.items.splice(itemIndex, 1);
        } else {
          // Actualizar cantidad
          state.items[itemIndex].quantity = quantity;
        }
      }

      // Recalcular totales
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;

      // Guardar en localStorage
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      saveCartToStorage(state.items);
    },

    // Para futuro: sincronizar carrito del usuario logueado
    syncCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalPrice = totals.totalPrice;
      saveCartToStorage(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  syncCart,
} = cartSlice.actions;

export default cartSlice.reducer;
