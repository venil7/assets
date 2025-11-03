import {
  defaultPasswordChange,
  passwordChangeValidator,
  type PasswordChange as RawPasswordChangeData,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useState } from "react";
import { withFetching } from "../../decorators/fetching";
import { PrimaryButton } from "../Form/FormControl";
import { FormErrors } from "../Form/FormErrors";
import { PasswordChangeForm } from "./PasswordChange";

type Props = {
  onUpdate: (p: RawPasswordChangeData) => void;
};

const RawPasswordChange: React.FC<Props> = ({ onUpdate }) => {
  const [pwdChange, setPwdChange] = useState(defaultPasswordChange());
  const { valid, errors } = passwordChangeValidator(pwdChange);
  const handlePassChange = () => onUpdate(pwdChange);
  return (
    <>
      <FormErrors errors={errors} valid={valid} />
      <PasswordChangeForm data={pwdChange} onChange={setPwdChange} />
      <PrimaryButton disabled={!valid} onClick={handlePassChange}>
        Submit
      </PrimaryButton>
    </>
  );
};

export const PasswordChange = pipe(RawPasswordChange, withFetching);
