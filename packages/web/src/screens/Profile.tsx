import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { StoreContext } from "../stores/store";

const RawProfileScreen: React.FC = () => {
  useSignals();
  const { profile } = use(StoreContext);

  useEffect(() => {
    profile.load();
  }, [profile]);

  return <pre>{JSON.stringify(profile.data, null, 2)}</pre>;
};

export { RawProfileScreen as ProfileScreen };
