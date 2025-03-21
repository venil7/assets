import { useEffect } from "react";
import { Outlet } from "react-router";
import type { Store } from "../stores/store";
import { AppLayout } from "./AppLayout";

export const AuthRouteWrapper: React.FC<{ store: Store }> = ({ store }) => {
  useEffect(() => {
    // console.log("auth wrapper");
  }, [store]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};
