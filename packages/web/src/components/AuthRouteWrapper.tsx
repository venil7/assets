import { Suspense, use, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { Navigate, Outlet } from "react-router";
import { StoreContext, type Store } from "../stores/store";
import { AppLayout } from "./AppLayout";

export const AuthRouteWrapper: React.FC<{ store: Store }> = ({ store }) => {
  useEffect(() => {
    // console.log("auth wrapper");
  }, [store]);

  const { auth } = use(StoreContext);
  const load = auth.load();

  const SuspendedComponent = () => {
    use(load);
    return auth.tokenExists.value ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <AppLayout>
      <Suspense fallback={<Spinner />}>
        <SuspendedComponent />
      </Suspense>
    </AppLayout>
  );
};
