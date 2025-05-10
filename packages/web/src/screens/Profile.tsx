import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { UserProfile } from "../components/Profile/Profile";
import { StoreContext } from "../stores/store";

const RawProfileScreen: React.FC = () => {
  useSignals();
  const { profile } = use(StoreContext);

  const handleUpdate = profile.update;

  useEffect(() => {
    profile.load();
  }, [profile]);

  return (
    <UserProfile
      error={profile.error.value}
      profile={profile.data.value}
      fetching={profile.fetching.value}
      onUpdate={handleUpdate}
    />
  );
};

export { RawProfileScreen as ProfileScreen };
