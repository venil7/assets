import * as React from "react";
import { useState } from "react";
import { Button, InputGroup } from "react-bootstrap";
import { FormEdit, FormPassword } from "./FormControl";

export type PasswordEditProps = {
  value: string;
  onChange: (s: string) => void;
  disabled?: boolean;
};

export const PasswordEdit: React.FC<PasswordEditProps> = ({
  value,
  onChange,
  disabled,
}: PasswordEditProps) => {
  const [visible, setVisible] = useState(false);
  const flip = () => setVisible((x) => !x);
  return (
    <InputGroup>
      <FormPassword
        hidden={visible}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <FormEdit
        hidden={!visible}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <InputGroup.Text>
        <Button onClick={flip}>&#128274;</Button>
      </InputGroup.Text>
    </InputGroup>
  );
};
