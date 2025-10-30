import type { Action, Credentials } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import * as TE from "fp-ts/lib/TaskEither";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Login } from "../components/Auth/Login";
import { routes } from "../components/Router";
import { Error } from "../decorators/errors";
import { useStore } from "../hooks/store";

const RawLoginScreen: React.FC = () => {
  useSignals();
  const navigate = useNavigate();
  const { auth } = useStore();

  const handleLogin = (creds: Credentials) => {
    const onSuccess: Action<void> = TE.fromTask<void>(() => {
      const navigateHome = async () => {
        await navigate(routes.portfolios());
      };
      return navigateHome();
    });
    auth.login(creds, onSuccess);
  };

  return (
    <>
      <Row>
        <Col md={{ span: 4, offset: 4 }}>
          <Error error={auth.error.value} />
        </Col>
        <Col md={{ span: 4, offset: 4 }}>
          <Login onLogin={handleLogin} />
        </Col>
      </Row>
    </>
  );
};

export { RawLoginScreen as LoginScreen };
