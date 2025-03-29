import { defaultCredentials } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import {
  FormEdit,
  FormPassword,
  PrimaryButton,
} from "../components/Form/FormControl";
import { useFormData } from "../hooks/formData";
import { useStore } from "../stores/store";

const RawLoginScreen: React.FC = () => {
  useSignals();
  const navigate = useNavigate();
  const { auth } = useStore();
  const [creds, setField] = useFormData(defaultCredentials());

  const handleSubmit = async () => {
    await auth.login(creds);
    navigate(`/portfolios`);
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>login</Form.Label>
        <FormEdit value={creds.username} onChange={setField("username")} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>password</Form.Label>
        <FormPassword value={creds.password} onChange={setField("password")} />
      </Form.Group>
      <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
    </Form>
  );
};

export { RawLoginScreen as LoginScreen };
