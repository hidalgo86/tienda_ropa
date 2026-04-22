"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { clearGuestCart, getGuestCart, syncCart } from "@/store/slices/cartSlice";
import { clearRemoteCart, listCartItems, upsertCartItem } from "@/services/cart";
import { getStoredAuthToken } from "@/services/users";
import type { AppDispatch } from "@/store";

export default function CartSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    let mounted = true;
    let syncing = false;

    const syncCartState = async () => {
      if (syncing) return;
      syncing = true;

      try {
        const token = getStoredAuthToken();

        if (!token) {
          if (mounted) {
            dispatch(syncCart(getGuestCart()));
          }
          return;
        }

        const guestCart = getGuestCart();
        let remoteCart = await listCartItems({ token });
        remoteCart = Array.isArray(remoteCart) ? remoteCart : [];

        if (guestCart.length > 0) {
          const mergedEntries = new Map<string, { productId: string; variantName?: string; quantity: number }>();

          for (const item of remoteCart) {
            const key = `${item.id}::${item.selectedSize ?? ""}`;
            mergedEntries.set(key, {
              productId: item.id,
              variantName: item.selectedSize,
              quantity: item.quantity,
            });
          }

          for (const item of guestCart) {
            const key = `${item.id}::${item.selectedSize ?? ""}`;
            const current = mergedEntries.get(key);
            mergedEntries.set(key, {
              productId: item.id,
              variantName: item.selectedSize,
              quantity: (current?.quantity ?? 0) + item.quantity,
            });
          }

          await clearRemoteCart({ token });

          for (const entry of mergedEntries.values()) {
            remoteCart = await upsertCartItem(
              {
                productId: entry.productId,
                quantity: entry.quantity,
                variantName: entry.variantName,
              },
              { token },
            );
            remoteCart = Array.isArray(remoteCart) ? remoteCart : [];
          }

          clearGuestCart();
        }

        if (mounted) {
          dispatch(syncCart(remoteCart));
        }
      } catch (error) {
        console.error("Error syncing cart:", error);

        if (!getStoredAuthToken() && mounted) {
          dispatch(syncCart(getGuestCart()));
        }
      } finally {
        syncing = false;
      }
    };

    void syncCartState();

    const handleSync = () => {
      void syncCartState();
    };

    window.addEventListener("auth:session-changed", handleSync);

    return () => {
      mounted = false;
      window.removeEventListener("auth:session-changed", handleSync);
    };
  }, [dispatch]);

  return <>{children}</>;
}
