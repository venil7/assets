import {
  defaultPasswordChange,
  type Credentials,
  type Profile,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useState } from "react";
import { withError, type WithError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { passwordChangeValidator } from "../../validation/credentials";
import { PrimaryButton } from "../Form/FormControl";
import { FormErrors } from "../Form/FormErrors";
import { PasswordChangeForm } from "./PasswordChangeForm";

type ProfileProps = {
  profile: Profile;
  onUpdate: (p: Credentials) => void;
};

const RawProfile: React.FC<ProfileProps> = ({
  profile,
  onUpdate,
}: ProfileProps) => {
  const [pwd, setPwd] = useState(defaultPasswordChange());
  const { valid, errors } = passwordChangeValidator(pwd);
  const handlePassChange = () =>
    onUpdate({ username: profile.username, password: pwd.password });
  return (
    <>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
      <PasswordChangeForm data={pwd} onChange={setPwd} />
      <PrimaryButton disabled={!valid} onClick={handlePassChange}>
        Submit
      </PrimaryButton>
      <FormErrors errors={errors} valid={valid} />
    </>
  );
};

export const UserProfile = pipe(
  RawProfile,
  withError<ProfileProps>,
  withNoData<WithError<ProfileProps>, "profile">((p) => p.profile),
  withFetching
);
