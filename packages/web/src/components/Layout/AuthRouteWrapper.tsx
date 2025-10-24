import * as E from "fp-ts/Either";
import { Suspense, use } from "react";
import { Spinner } from "react-bootstrap";
import { Navigate, Outlet } from "react-router";
import { type Store } from "../../stores/store";
import { routes } from "../Router";
import { AppLayout } from "./AppLayout";

export const AuthRouteWrapper: React.FC<{ store: Store }> = ({ store }) => {
  const { auth } = store;
  const load = auth.load();

  const SuspendedComponent = () => {
    const token = use(load);
    if (E.isRight(token)) return <Outlet />;
    return <Navigate to={routes.login()} replace />;
  };

  return (
    <AppLayout>
      <Suspense fallback={<Spinner />}>
        <SuspendedComponent />
      </Suspense>
    </AppLayout>
  );
};
