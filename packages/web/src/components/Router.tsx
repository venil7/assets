import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { createBrowserRouter, Navigate } from "react-router";
import { AssetScreen } from "../screens/Asset";
import { LoginScreen } from "../screens/Login";
import { PortfolioDetailsScreen } from "../screens/PortfolioDetails";
import { PortfoliosScreen } from "../screens/Portfolios";
import { env } from "../services/env";
import { store } from "../stores/store";
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
          path: "/portfolios/:portfolioId",
          element: <PortfolioDetailsScreen />,
        },
        {
          path: "/portfolios/:portfolioId/assets/:assetId",
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

const login = () => "/login";
const logout = () => "/logout";
const portfolios = () => "/portfolios";
const portfolio = (portfolioId: number) => `/portfolios/${portfolioId}`;
const asset = (portfolioId: number, assetId: number) =>
  `${portfolio(portfolioId)}/assets/${assetId}`;

export const routes = {
  portfolios,
  portfolio,
  asset,
  login,
  logout,
};
