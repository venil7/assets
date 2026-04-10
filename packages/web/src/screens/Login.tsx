import type { Action, Credentials } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { useHead } from "@unhead/react";
import * as TE from "fp-ts/lib/TaskEither";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Login } from "../components/Auth/Login";
import { routes } from "../components/Router";
import { Error } from "../decorators/errors";
import { useStore } from "../hooks/store";
import "./Login.scss";

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

  useHead({ title: `Assets - Login` });

  return (
    <div className="login-container">
      <Row className="w-100">
        <Col
          md={{ span: 4, offset: 4 }}
          sm={12}
          className="d-flex flex-column gap-3"
        >
          <Error error={auth.error.value} />
          <Login onLogin={handleLogin} />
        </Col>
      </Row>
    </div>
  );
};

export { RawLoginScreen as LoginScreen };
