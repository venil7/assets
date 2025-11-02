import {
  defaultCredentials,
  defaultPasswordChange,
  type Credentials as CredentialsData,
  type Profile,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useState } from "react";
import { withFetching } from "../../decorators/fetching";
import { passwordChangeValidator } from "../../validation/credentials";
import { PrimaryButton } from "../Form/FormControl";
import { FormErrors } from "../Form/FormErrors";
import { PasswordChangeForm } from "./PasswordChangeForm";

type Props = {
  profile: Profile;
  onUpdate: (p: CredentialsData) => void;
};

const RawCredentials: React.FC<Props> = ({ profile, onUpdate }) => {
  const [pwd, setPwd] = useState(defaultPasswordChange());
  const { valid, errors } = passwordChangeValidator(pwd);
  const handlePassChange = () =>
    onUpdate({
      ...defaultCredentials(),
      username: profile.username,
      password: pwd.password,
    });
  return (
    <>
      <FormErrors errors={errors} valid={valid} />
      <PasswordChangeForm data={pwd} onChange={setPwd} />
      <PrimaryButton disabled={!valid} onClick={handlePassChange}>
        Submit
      </PrimaryButton>
    </>
  );
};

export const Credentials = pipe(RawCredentials, withFetching);
