import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import "../App.css";
import { AssetScreen } from "../screens/Asset";
import { LoginScreen } from "../screens/Login";
import { PortfolioDetailsScreen } from "../screens/PortfolioDetails";
import { PortfoliosScreen } from "../screens/Portfolios";
import { env } from "../services/env";
import { store, StoreContext } from "../stores/store";
import { AuthRouteWrapper } from "./AuthRouteWrapper";

const basename = pipe(
  env("VITE_ASSET_BASENAME"),
  E.getOrElse(() => "/app")
);

export const router = createBrowserRouter(
  [
    {
      element: <AuthRouteWrapper store={store} />,
      children: [
        { path: "/portfolios", element: <PortfoliosScreen /> },
        {
          path: "/portfolio/:portfolioId",
          element: <PortfolioDetailsScreen />,
        },
        {
          path: "/portfolio/:portfolioId",
          element: <PortfolioDetailsScreen />,
        },
        {
          path: "/portfolio/:portfolioId/asset/:assetId",
          element: <AssetScreen />,
        },
      ],
    },
    {
      children: [
        { path: "/login", element: <LoginScreen /> },
        { path: "/logout", element: <LoginScreen /> },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/portfolios" replace />,
    },
  ],
  { basename }
);

export const App: React.FC = () => {
  return (
    <StoreContext.Provider value={store}>
      <RouterProvider router={router} />
    </StoreContext.Provider>
  );
};
