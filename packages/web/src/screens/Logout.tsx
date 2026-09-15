import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Navigate } from "react-router";
import { routes } from "../components/Router";
import { useStore } from "../hooks/store";

const RawLogoutScreen: React.FC = () => {
  useSignals();
  const { auth } = useStore();

  useEffect(() => {
    auth.logout();
  }, []);

  return (
    <>
      <Navigate to={routes.login()} />
    </>
  );
};

export { RawLogoutScreen as LogoutScreen };
