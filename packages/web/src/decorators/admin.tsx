import React, { useEffect } from "react";
import { useStore } from "../stores/store";
import type { Props } from "./fetching";

export function withAdminRestriction<P extends Props>(
  Component: React.FC<P>
): React.FC<P> {
  return (props: P) => {
    const { profile } = useStore();
    useEffect(() => {
      profile.load();
    }, [profile.data]);

    return profile.data.value?.admin ? (
      <Component {...props} />
    ) : (
      <>You dont have enough priviledge to see this content</>
    );
  };
}
