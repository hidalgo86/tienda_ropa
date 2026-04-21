"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { Product } from "@/types/domain/products";
import type { AppDispatch, RootState } from "@/store";
import {
  clearFavorites,
  syncFavorites,
  toggleFavorite,
} from "@/store/slices/favoriteSlice";
import {
  addFavoriteProduct,
  clearFavoriteProducts,
  removeFavoriteProduct,
} from "@/services/favorites";
import { getStoredAuthToken } from "@/services/users";

export const useFavoriteActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const favoriteItems = useSelector((state: RootState) => state.favorites.items);

  const toggleProductFavorite = React.useCallback(
    async (product: Product) => {
      const token = getStoredAuthToken();

      if (!token) {
        dispatch(toggleFavorite(product));
        return;
      }

      const isFavorite = favoriteItems.some((item) => item.id === product.id);

      try {
        const nextFavorites = isFavorite
          ? await removeFavoriteProduct(product.id, { token })
          : await addFavoriteProduct(product.id, { token });

        dispatch(syncFavorites(nextFavorites));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar favoritos";
        toast.error(message);
      }
    },
    [dispatch, favoriteItems],
  );

  const clearAllFavorites = React.useCallback(async () => {
    const token = getStoredAuthToken();

    if (!token) {
      dispatch(clearFavorites());
      return;
    }

    try {
      await clearFavoriteProducts({ token });
      dispatch(syncFavorites([]));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo limpiar favoritos";
      toast.error(message);
    }
  }, [dispatch]);

  return {
    favoriteItems,
    toggleProductFavorite,
    clearAllFavorites,
  };
};
