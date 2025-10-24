import * as E from "fp-ts/Either";
import { Suspense, use } from "react";
import { Spinner } from "react-bootstrap";
import { Navigate, Outlet } from "react-router";
import { type Store } from "../../stores/store";
import { AppLayout } from "./AppLayout";

export const AuthRouteWrapper: React.FC<{ store: Store }> = ({ store }) => {
  const { auth } = store;
  const load = auth.load();

  const SuspendedComponent = () => {
    return E.isRight(use(load)) ? <Outlet /> : <Navigate to="/login" replace />;
  };

  return (
    <AppLayout>
      <Suspense fallback={<Spinner />}>
        <SuspendedComponent />
      </Suspense>
    </AppLayout>
  );
};
