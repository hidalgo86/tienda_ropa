"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import CartSyncProvider from "@/components/providers/CartSyncProvider";
import FavoritesSyncProvider from "@/components/providers/FavoritesSyncProvider";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <FavoritesSyncProvider>
        <CartSyncProvider>{children}</CartSyncProvider>
      </FavoritesSyncProvider>
    </Provider>
  );
}
