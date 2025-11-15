import {
  type PasswordChange as PasswordChangeData,
  type Prefs as PrefsData,
  type Profile,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Col, Row } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withNoData, type WithNoData } from "../../decorators/nodata";
import { TabContent, Tabs } from "../Form/Tabs";
import { PasswordChange } from "./PasswordChange";
import { Prefs } from "./Prefs";
import { ProfileDetails } from "./ProfileDetails";

const TABS = ["Profile", "Password", "Prefs"] as const;

type ProfileProps = {
  profile: Profile;
  prefs: PrefsData;
  onProfileDetele: () => void;
  onPrefsUpdate: (p: PrefsData) => void;
  onPasswordUpdate: (p: PasswordChangeData) => void;
  innerFetching: [profile: boolean, prefs: boolean];
};

const RawProfile: React.FC<ProfileProps> = ({
  prefs,
  profile,
  onPrefsUpdate,
  onProfileDetele,
  onPasswordUpdate,
  innerFetching: [profileFetching, prefsFetching],
}: ProfileProps) => {
  return (
    <Row>
      <Col md={4}>
        <Tabs tabs={TABS}>
          <TabContent tab={0}>
            <ProfileDetails
              profile={profile}
              onDelete={onProfileDetele}
              fetching={profileFetching}
            />
          </TabContent>
          <TabContent tab={1}>
            <PasswordChange
              onSubmit={onPasswordUpdate}
              fetching={profileFetching}
            />
          </TabContent>
          <TabContent tab={2}>
            <Prefs
              prefs={prefs}
              onUpdate={onPrefsUpdate}
              fetching={prefsFetching}
            />
          </TabContent>
        </Tabs>
      </Col>
    </Row>
  );
};

export const UserProfile = pipe(
  RawProfile,
  withNoData<ProfileProps, "profile" | "prefs">((p) => p.profile || p.prefs),
  withError<WithNoData<ProfileProps, "profile" | "prefs">>
);
