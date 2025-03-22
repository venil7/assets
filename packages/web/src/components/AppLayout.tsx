import type { PropsWithChildren } from "react";
import { Container } from "react-bootstrap";
import { TopNav } from "./TopNav";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container>
      <TopNav />

      {children}
    </Container>
  );
};
