"use client";

import React from "react";
import { useDispatch } from "react-redux";
import {
  clearGuestFavorites,
  getGuestFavorites,
  syncFavorites,
} from "@/store/slices/favoriteSlice";
import { addFavoriteProduct, listFavoriteProducts } from "@/services/favorites";
import { getStoredAuthToken } from "@/services/users";
import type { AppDispatch } from "@/store";

export default function FavoritesSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    let mounted = true;
    let syncing = false;

    const syncFavoritesState = async () => {
      if (syncing) return;
      syncing = true;

      try {
        const token = getStoredAuthToken();

        if (!token) {
          if (mounted) {
            dispatch(syncFavorites(getGuestFavorites()));
          }
          return;
        }

        const guestFavorites = getGuestFavorites();
        let remoteFavorites = await listFavoriteProducts({ token });
        const remoteIds = new Set(remoteFavorites.map((product) => product.id));
        const missingGuestFavorites = guestFavorites.filter(
          (product) => product.id && !remoteIds.has(product.id),
        );

        for (const product of missingGuestFavorites) {
          remoteFavorites = await addFavoriteProduct(product.id, { token });
        }

        if (missingGuestFavorites.length > 0) {
          clearGuestFavorites();
        }

        if (mounted) {
          dispatch(syncFavorites(remoteFavorites));
        }
      } catch (error) {
        console.error("Error syncing favorites:", error);

        if (!getStoredAuthToken() && mounted) {
          dispatch(syncFavorites(getGuestFavorites()));
        }
      } finally {
        syncing = false;
      }
    };

    void syncFavoritesState();

    const handleSync = () => {
      void syncFavoritesState();
    };

    window.addEventListener("auth:session-changed", handleSync);

    return () => {
      mounted = false;
      window.removeEventListener("auth:session-changed", handleSync);
    };
  }, [dispatch]);

  return <>{children}</>;
}
