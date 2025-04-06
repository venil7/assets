import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router";
import { useStore } from "../stores/store";

const RawLogoutScreen: React.FC = () => {
  useSignals();
  const navigate = useNavigate();
  const { auth } = useStore();

  useEffect(() => {
    auth.logout();
  }, []);

  return (
    <>
      <Navigate to="/login" />
    </>
  );
};

export { RawLogoutScreen as LogoutScreen };
