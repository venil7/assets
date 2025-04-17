import { defaultCredentials, type Credentials } from "@darkruby/assets-core";
import { CredenatialsDecoder } from "@darkruby/assets-core/src/decoders/user";
import { Form } from "react-bootstrap";
import { usePartialState } from "../../hooks/formData";
import { createValidator } from "../../util/validation";
import { FormEdit, FormPassword, PrimaryButton } from "../Form/FormControl";

export type LoginProps = {
  onLogin: (c: Credentials) => void;
};

const credValidator = createValidator(CredenatialsDecoder);

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [creds, setField] = usePartialState(defaultCredentials());
  const handleSubmit = () => onLogin(creds);

  const { valid } = credValidator(creds);
  const handleUsername = setField("username") as (x: string) => void;
  const handlePassword = setField("password") as (x: string) => void;

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Login</Form.Label>
        <FormEdit value={creds.username} onChange={handleUsername} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <FormPassword value={creds.password} onChange={handlePassword} />
      </Form.Group>
      <PrimaryButton onClick={handleSubmit} disabled={!valid}>
        Submit
      </PrimaryButton>
    </Form>
  );
};
