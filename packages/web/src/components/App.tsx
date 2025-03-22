import React from "react";
import { RouterProvider } from "react-router";
import { store, StoreContext } from "../stores/store";
import { router } from "./Router";

export const App: React.FC = () => {
  return (
    <StoreContext.Provider value={store}>
      <RouterProvider router={router} />
    </StoreContext.Provider>
  );
};
