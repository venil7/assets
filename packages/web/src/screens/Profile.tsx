import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { UserProfile } from "../components/Profile/Profile";
import { StoreContext } from "../hooks/store";

const RawProfileScreen: React.FC = () => {
  useSignals();
  const { profile, prefs, auth } = use(StoreContext);

  const handlePasswordUpdate = profile.password;
  const handlePrefsUpdate = prefs.update;
  const handleProfileDelete = () => {
    profile.delete();
    auth.logout();
  };

  useEffect(() => {
    profile.load();
    prefs.load();
  }, [profile, prefs]);

  return (
    <UserProfile
      prefs={prefs.data.value}
      profile={profile.data.value}
      onPrefsUpdate={handlePrefsUpdate}
      onProfileDetele={handleProfileDelete}
      onPasswordUpdate={handlePasswordUpdate}
      error={profile.error.value || prefs.error.value}
      innerFetching={[profile.fetching.value, prefs.fetching.value]}
    />
  );
};

export { RawProfileScreen as ProfileScreen };
