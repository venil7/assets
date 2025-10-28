import type { Profile } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { withFetching } from "../../decorators/fetching";
import { yesNo } from "../../util/yesno";

type ProfileDetailsProps = {
  profile: Profile;
};

const RawProfileDetails: React.FC<ProfileDetailsProps> = ({ profile }) => {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text id="profile-id">Id</InputGroup.Text>
        <Form.Control disabled value={profile.id} />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text id="profile-username">Username</InputGroup.Text>
        <Form.Control disabled value={profile.username} />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text id="profile-admin">Admin</InputGroup.Text>
        <Form.Control disabled value={yesNo(profile.admin)} />
      </InputGroup>
    </>
  );
};

export const ProfileDetails = pipe(RawProfileDetails, withFetching);
