import React, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { store, StoreContext } from "../stores/store";
import { router } from "./Router";

export const App: React.FC = () => {
  useEffect(() => {
    console.log("token refresh");
    store.auth.refresh();
  }, []);
  return (
    <StoreContext.Provider value={store}>
      <RouterProvider router={router} />
    </StoreContext.Provider>
  );
};
