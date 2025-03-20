import { Suspense, use } from "react";
import { Navigate } from "react-router";
import { StoreContext } from "../stores/store";
import { type Props } from "./fetching";

// export function _withAuth<P extends Props>(
//   Component: React.FC<P>
// ): React.FC<P> {
//   return (props: Props) => {
//     return true ? <Component {...(props as P)} /> : <Navigate to="/login" />;
//   };
// }

export function withAuth<P extends Props>(Component: React.FC<P>): React.FC<P> {
  return (props: Props) => {
    const { auth } = use(StoreContext);
    const load = auth.load();

    const SuspendedComponent = () => {
      use(load);
      return auth.tokenExists.value ? (
        <Component {...(props as P)} />
      ) : (
        <Navigate to="/login" />
      );
    };

    return (
      <Suspense fallback="loading">
        <SuspendedComponent />
      </Suspense>
    );
  };
}
