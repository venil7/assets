import type { PropsWithChildren } from "react";
import { Container } from "react-bootstrap";
import { TopNav } from "../TopNav";
import "./AppLayour.scss";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container>
      <TopNav />

      <div className="content">{children}</div>
    </Container>
  );
};
