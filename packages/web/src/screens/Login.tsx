import type { Credentials } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Login } from "../components/Auth/Login";
import { useStore } from "../stores/store";
import { wait } from "../util/promise";

const RawLoginScreen: React.FC = () => {
  useSignals();
  const navigate = useNavigate();
  const { auth } = useStore();

  const handleLogin = (creds: Credentials) => {
    auth
      .login(creds)
      .then(() => wait(0.2))
      .then(() => navigate(`/portfolios`));
  };

  return (
    <Row>
      <Col md={{ span: 4, offset: 4 }}>
        <Login onLogin={handleLogin} />
      </Col>
    </Row>
  );
};

export { RawLoginScreen as LoginScreen };
