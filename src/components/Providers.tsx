"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import { SessionProvider } from "next-auth/react";
import { ToastNotification } from "./ui/ToastNotification";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
          <ToastNotification />
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
