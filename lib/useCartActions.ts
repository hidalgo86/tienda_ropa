"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  findVariantBySelection,
  getProductStock,
  type Product,
} from "@/types/domain/products";
import type { AppDispatch, RootState } from "@/store";
import {
  addToCart,
  clearCart,
  removeFromCart,
  syncCart,
  updateQuantity,
  type CartItem,
} from "@/store/slices/cartSlice";
import { clearRemoteCart, upsertCartItem } from "@/services/cart";
import {
  clearStoredSession,
  getStoredAuthToken,
  getValidStoredAuthToken,
} from "@/services/users";

type CartIdentity = {
  productId: string;
  selectedSize?: string;
  selectedColor?: string;
};

const isSessionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    message.includes("token") ||
    message.includes("jwt") ||
    message.includes("unauthorized") ||
    message.includes("unauthoriz") ||
    message.includes("sesion") ||
    message.includes("session")
  );
};

const getCartItemKey = (item: CartIdentity): string =>
  `${item.productId}::${item.selectedSize ?? ""}::${item.selectedColor ?? ""}`;

const getAvailableStockForSelection = (
  product: Product,
  selectedSize?: string,
): number => {
  if (selectedSize) {
    return Math.max(
      0,
      Number(findVariantBySelection(product.variants, selectedSize)?.stock ?? 0),
    );
  }

  return getProductStock(product);
};

const buildOptimisticCartItems = (
  currentItems: CartItem[],
  input: {
    product: Product;
    quantity?: number;
    selectedSize?: string;
    selectedColor?: string;
  },
): CartItem[] => {
  const quantityToAdd = input.quantity ?? 1;
  const nextItems = [...currentItems];
  const itemIndex = nextItems.findIndex(
    (item) =>
      item.id === input.product.id &&
      item.selectedSize === input.selectedSize &&
      item.selectedColor === input.selectedColor,
  );

  if (itemIndex >= 0) {
    nextItems[itemIndex] = {
      ...nextItems[itemIndex],
      quantity: nextItems[itemIndex].quantity + quantityToAdd,
    };
    return nextItems;
  }

  return [
    ...nextItems,
    {
      ...input.product,
      quantity: quantityToAdd,
      selectedSize: input.selectedSize,
      selectedColor: input.selectedColor,
    },
  ];
};

const mergeCartItems = (
  remoteItems: CartItem[],
  fallbackItems: CartItem[],
): CartItem[] => {
  const mergedItems = new Map<string, CartItem>();

  for (const item of fallbackItems) {
    mergedItems.set(
      getCartItemKey({
        productId: item.id,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }),
      item,
    );
  }

  for (const item of remoteItems) {
    mergedItems.set(
      getCartItemKey({
        productId: item.id,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }),
      item,
    );
  }

  return Array.from(mergedItems.values());
};

const updateCartItemsQuantity = (
  currentItems: CartItem[],
  input: CartIdentity & { quantity: number },
): CartItem[] => {
  return currentItems
    .map((item) => {
      const isTargetItem =
        item.id === input.productId &&
        item.selectedSize === input.selectedSize &&
        item.selectedColor === input.selectedColor;

      return isTargetItem ? { ...item, quantity: input.quantity } : item;
    })
    .filter((item) => item.quantity > 0);
};

export const useCartActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  const persistRemoteQuantity = React.useCallback(
    async (productId: string, quantity: number, selectedSize?: string) => {
      const token = getValidStoredAuthToken();
      if (!token) return { ok: false, sessionExpired: false, items: [] };

      try {
        const nextCart = await upsertCartItem(
          {
            productId,
            quantity,
            variantName: selectedSize,
          },
          { token },
        );
        return {
          ok: true,
          sessionExpired: false,
          items: Array.isArray(nextCart) ? nextCart : [],
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el carrito";
        const sessionExpired = isSessionError(error);

        if (sessionExpired) {
          clearStoredSession();
          return { ok: false, sessionExpired: true, items: [] };
        }

        toast.error(message);
        return { ok: false, sessionExpired: false, items: [] };
      }
    },
    [],
  );

  const addProductToCart = React.useCallback(
    async (input: {
      product: Product;
      quantity?: number;
      selectedSize?: string;
      selectedColor?: string;
    }) => {
      const requestedQuantity = input.quantity ?? 1;
      const existingItem = cart.items.find(
        (item) =>
          item.id === input.product.id &&
          item.selectedSize === input.selectedSize &&
          item.selectedColor === input.selectedColor,
      );
      const availableStock = getAvailableStockForSelection(
        input.product,
        input.selectedSize,
      );
      const nextQuantity = (existingItem?.quantity ?? 0) + requestedQuantity;

      if (availableStock <= 0) {
        toast.error("Este producto no tiene stock disponible.");
        return;
      }

      if (nextQuantity > availableStock) {
        toast.error(
          `Solo hay ${availableStock} unidad${availableStock === 1 ? "" : "es"} disponible${availableStock === 1 ? "" : "s"}.`,
        );
        return;
      }

      const token = getValidStoredAuthToken();
      if (!token) {
        dispatch(addToCart({ ...input, quantity: requestedQuantity }));
        return;
      }

      const optimisticItems = buildOptimisticCartItems(cart.items, {
        ...input,
        quantity: requestedQuantity,
      });
      dispatch(syncCart(optimisticItems));

      const result = await persistRemoteQuantity(
        input.product.id,
        nextQuantity,
        input.selectedSize,
      );

      if (!result.ok) {
        if (result.sessionExpired) {
          toast.info("Tu sesion expiro. Agregamos el producto al carrito local.");
        }
        return;
      }

      dispatch(syncCart(mergeCartItems(result.items, optimisticItems)));
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
      const existingItem = cart.items.find(
        (item) =>
          item.id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor,
      );

      if (quantity > 0 && existingItem) {
        const availableStock = getAvailableStockForSelection(
          existingItem,
          selectedSize,
        );

        if (quantity > availableStock) {
          toast.error(
            `Solo hay ${availableStock} unidad${availableStock === 1 ? "" : "es"} disponible${availableStock === 1 ? "" : "s"}.`,
          );
          return;
        }
      }

      const token = getValidStoredAuthToken();
      if (!token) {
        dispatch(
          updateQuantity({ productId, quantity, selectedSize, selectedColor }),
        );
        return;
      }

      const optimisticItems = updateCartItemsQuantity(cart.items, {
        productId,
        quantity,
        selectedSize,
        selectedColor,
      });
      dispatch(
        updateQuantity({ productId, quantity, selectedSize, selectedColor }),
      );

      const result = await persistRemoteQuantity(productId, quantity, selectedSize);

      if (result.ok) {
        dispatch(syncCart(mergeCartItems(result.items, optimisticItems)));
        return;
      }

      if (result.sessionExpired) {
        dispatch(
          updateQuantity({ productId, quantity, selectedSize, selectedColor }),
        );
        toast.info("Tu sesion expiro. Actualizamos el carrito local.");
      }
    },
    [cart.items, dispatch, persistRemoteQuantity],
  );

  const removeCartItem = React.useCallback(
    async ({ productId, selectedSize, selectedColor }: CartIdentity) => {
      const token = getValidStoredAuthToken();
      if (!token) {
        dispatch(removeFromCart({ productId, selectedSize, selectedColor }));
        return;
      }

      const optimisticItems = cart.items.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          ),
      );
      dispatch(removeFromCart({ productId, selectedSize, selectedColor }));

      const result = await persistRemoteQuantity(productId, 0, selectedSize);

      if (result.ok) {
        dispatch(syncCart(mergeCartItems(result.items, optimisticItems)));
        return;
      }

      if (result.sessionExpired) {
        dispatch(removeFromCart({ productId, selectedSize, selectedColor }));
        toast.info("Tu sesion expiro. Actualizamos el carrito local.");
      }
    },
    [cart.items, dispatch, persistRemoteQuantity],
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
