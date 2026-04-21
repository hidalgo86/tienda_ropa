"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import type { Product } from "@/types/domain/products";
import type { AppDispatch, RootState } from "@/store";
import {
  addToCart,
  clearCart,
  removeFromCart,
  syncCart,
  updateQuantity,
} from "@/store/slices/cartSlice";
import { clearRemoteCart, upsertCartItem } from "@/services/cart";
import { getStoredAuthToken } from "@/services/users";

type CartIdentity = {
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
};

export const useCartActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  const persistRemoteQuantity = React.useCallback(
    async (productId: string, quantity: number, selectedSize?: string) => {
      const token = getStoredAuthToken();
      if (!token) return false;

      try {
        const nextCart = await upsertCartItem(
          {
            productId,
            quantity,
            variantName: selectedSize,
          },
          { token },
        );
        dispatch(syncCart(nextCart));
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el carrito";
        toast.error(message);
        return true;
      }
    },
    [dispatch],
  );

  const addProductToCart = React.useCallback(
    async (input: {
      product: Product;
      quantity?: number;
      selectedSize?: string;
      selectedColor?: string;
    }) => {
      const token = getStoredAuthToken();
      if (!token) {
        dispatch(addToCart(input));
        return;
      }

      const existingItem = cart.items.find(
        (item) =>
          item.id === input.product.id &&
          item.selectedSize === input.selectedSize &&
          item.selectedColor === input.selectedColor,
      );

      await persistRemoteQuantity(
        input.product.id,
        (existingItem?.quantity ?? 0) + (input.quantity ?? 1),
        input.selectedSize,
      );
    },
    [cart.items, dispatch, persistRemoteQuantity],
  );

  const changeCartItemQuantity = React.useCallback(
    async ({
      productId,
      quantity,
      selectedSize,
      selectedColor,
    }: CartIdentity & { quantity: number }) => {
      const token = getStoredAuthToken();
      if (!token) {
        dispatch(
          updateQuantity({ productId, quantity, selectedSize, selectedColor }),
        );
        return;
      }

      await persistRemoteQuantity(productId, quantity, selectedSize);
    },
    [dispatch, persistRemoteQuantity],
  );

  const removeCartItem = React.useCallback(
    async ({ productId, selectedSize, selectedColor }: CartIdentity) => {
      const token = getStoredAuthToken();
      if (!token) {
        dispatch(removeFromCart({ productId, selectedSize, selectedColor }));
        return;
      }

      await persistRemoteQuantity(productId, 0, selectedSize);
    },
    [dispatch, persistRemoteQuantity],
  );

  const clearAllCart = React.useCallback(async () => {
    const token = getStoredAuthToken();
    if (!token) {
      dispatch(clearCart());
      return;
    }

    try {
      await clearRemoteCart({ token });
      dispatch(syncCart([]));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo limpiar el carrito";
      toast.error(message);
    }
  }, [dispatch]);

  return {
    cart,
    addProductToCart,
    changeCartItemQuantity,
    removeCartItem,
    clearAllCart,
  };
};
