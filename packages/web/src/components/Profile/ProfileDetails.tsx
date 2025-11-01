import type { Profile } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { withFetching } from "../../decorators/fetching";
import { yesNo } from "../../util/yesno";
import { DangerButton } from "../Form/FormControl";
import { confirmationModal } from "../Modals/Confirmation";

type ProfileDetailsProps = {
  profile: Profile;
  onDelete: () => void;
};

const RawProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  onDelete,
}) => {
  const handleDelete = () =>
    pipe(
      () =>
        confirmationModal(
          `Delete this profile? This action can not be undone.`
        ),
      TE.map(onDelete)
    )();

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
      <DangerButton onClick={handleDelete}>Delete Profile</DangerButton>
    </>
  );
};

export const ProfileDetails = pipe(RawProfileDetails, withFetching);
