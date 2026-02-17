import { useSignals } from "@preact/signals-react/runtime";
import { useHead } from "@unhead/react";
import { use, useEffect } from "react";
import { UserProfile } from "../components/Profile/Profile";
import { StoreContext } from "../hooks/store";

const RawProfileScreen: React.FC = () => {
  useSignals();
  const { asset, portfolio, profile, prefs, auth } = use(StoreContext);

  const load = () => {
    asset.reset();
    portfolio.reset();

    profile.load();
    prefs.load();
  };

  const handlePasswordUpdate = profile.password;
  const handlePrefsUpdate = prefs.update;
  const handleProfileDelete = () => {
    profile.delete();
    auth.logout();
  };

  useEffect(() => {
    load();
  }, [profile, prefs]);

  useHead({ title: `Assets - ${profile.data.value?.username}` });

  return (
    <UserProfile
      prefs={prefs.data.value}
      profile={profile.data.value}
      onPrefsUpdate={handlePrefsUpdate}
      onProfileDetele={handleProfileDelete}
      onPasswordUpdate={handlePasswordUpdate}
      error={profile.error.value || prefs.error.value}
      innerFetching={[profile.fetching.value, prefs.fetching.value]}
      onErrorDismiss={profile.load}
    />
  );
};

export { RawProfileScreen as ProfileScreen };
