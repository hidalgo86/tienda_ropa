import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/domain/products";

interface FavoriteState {
  items: Product[];
}

const GUEST_FAVORITES_KEY = "guestFavorites";
const AUTH_TOKEN_KEY = "authToken";

const hasActiveSession = (): boolean => {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(AUTH_TOKEN_KEY));
};

export const getGuestFavorites = (): Product[] => {
  if (typeof window === "undefined") return [];

  try {
    const savedFavorites = window.localStorage.getItem(GUEST_FAVORITES_KEY);
    return savedFavorites ? (JSON.parse(savedFavorites) as Product[]) : [];
  } catch (error) {
    console.error("Error loading guest favorites from localStorage:", error);
    return [];
  }
};

export const setGuestFavorites = (favorites: Product[]): void => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      GUEST_FAVORITES_KEY,
      JSON.stringify(favorites),
    );
  } catch (error) {
    console.error("Error saving guest favorites to localStorage:", error);
  }
};

export const clearGuestFavorites = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_FAVORITES_KEY);
};

const persistGuestFavorites = (favorites: Product[]): void => {
  if (hasActiveSession()) return;
  setGuestFavorites(favorites);
};

const initialState: FavoriteState = {
  items: getGuestFavorites(),
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (!existingItem) {
        state.items.push(action.payload);
        persistGuestFavorites(state.items);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistGuestFavorites(state.items);
    },
    toggleFavorite: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );
      if (existingItem) {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
      } else {
        state.items.push(action.payload);
      }
      persistGuestFavorites(state.items);
    },
    clearFavorites: (state) => {
      state.items = [];
      persistGuestFavorites(state.items);
    },
    syncFavorites: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  syncFavorites,
} = favoriteSlice.actions;

export default favoriteSlice.reducer;
