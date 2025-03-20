import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "../App.css";
import { AssetScreen } from "../screens/Asset";
import { LoginScreen } from "../screens/Login";
import { PortfolioDetailsScreen } from "../screens/PortfolioDetails";
import { PortfoliosScreen } from "../screens/Portfolios";
import { TestScreen } from "../screens/Test";
import { store, StoreContext } from "../stores/store";

export const App: React.FC = () => {
  return (
    <StoreContext.Provider value={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/portfolios" element={<PortfoliosScreen />} />
          <Route path="/portfolio/:id" element={<PortfolioDetailsScreen />} />
          <Route
            path="/portfolio/:portfolioId/asset/:id"
            element={<AssetScreen />}
          />
          <Route path="/test" element={<TestScreen />} />
          <Route path="*" element={<Navigate to="/portfolios" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreContext.Provider>
  );
};
