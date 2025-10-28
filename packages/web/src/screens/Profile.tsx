import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { UserProfile } from "../components/Profile/Profile";
import { StoreContext } from "../hooks/store";

const RawProfileScreen: React.FC = () => {
  useSignals();
  const { profile, preferences } = use(StoreContext);

  const handleCredentialsUpdate = profile.update;
  const handlePrefsUpdate = preferences.update;

  useEffect(() => {
    profile.load();
    preferences.load();
  }, [profile, preferences]);

  return (
    <UserProfile
      profile={profile.data.value}
      prefs={preferences.data.value}
      onPrefsUpdate={handlePrefsUpdate}
      onCredentialsUpdate={handleCredentialsUpdate}
      error={profile.error.value || preferences.error.value}
      innerFetching={[profile.fetching.value, preferences.fetching.value]}
    />
  );
};

export { RawProfileScreen as ProfileScreen };
