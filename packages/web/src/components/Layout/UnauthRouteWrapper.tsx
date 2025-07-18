import type { PropsWithChildren } from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import "./AppLayout.scss";

export const UnauthRouteWrapper: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Container>
      <Outlet />
    </Container>
  );
};
