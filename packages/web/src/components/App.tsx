import React, { createContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PortfoliosScreen } from "../screens/Portfolios";
import { createStore, Store } from "../stores/store";

const store = createStore();
export const StoreContext = createContext<Store>(store);

export const App: React.FC = () => {
  return (
    <StoreContext.Provider value={store}>
      {/* <Header /> */}
      <BrowserRouter>
        <Routes>
          <Route path="/portfolios" element={<PortfoliosScreen />} />
          <Route path="*" element={<Navigate to="/portfolios" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreContext.Provider>
  );
};
