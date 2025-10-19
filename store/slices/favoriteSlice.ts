import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductServer } from "@/types/product.type";

interface FavoriteState {
  items: ProductServer[];
}

// Función para cargar favoritos desde localStorage
const loadFavoritesFromStorage = (): ProductServer[] => {
  if (typeof window === "undefined") return [];

  try {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch (error) {
    console.error("Error loading favorites from localStorage:", error);
    return [];
  }
};

// Función para guardar favoritos en localStorage
const saveFavoritesToStorage = (favorites: ProductServer[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites to localStorage:", error);
  }
};

const initialState: FavoriteState = {
  items: loadFavoritesFromStorage(),
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<ProductServer>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (!existingItem) {
        state.items.push(action.payload);
        saveFavoritesToStorage(state.items);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveFavoritesToStorage(state.items);
    },
    toggleFavorite: (state, action: PayloadAction<ProductServer>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id
        );
      } else {
        state.items.push(action.payload);
      }
      saveFavoritesToStorage(state.items);
    },
    clearFavorites: (state) => {
      state.items = [];
      saveFavoritesToStorage(state.items);
    },
    // Para futuro: sincronizar favoritos del usuario logueado
    syncFavorites: (state, action: PayloadAction<ProductServer[]>) => {
      state.items = action.payload;
      saveFavoritesToStorage(state.items);
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
