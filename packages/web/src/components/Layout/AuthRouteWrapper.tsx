import { Suspense, use } from "react";
import { Spinner } from "react-bootstrap";
import { Navigate, Outlet } from "react-router";
import { type Store } from "../../stores/store";
import { AppLayout } from "./AppLayout";

export const AuthRouteWrapper: React.FC<{ store: Store }> = ({ store }) => {
  const { auth } = store; //use(StoreContext);
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
