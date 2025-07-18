import type { PropsWithChildren } from "react";
import { Container } from "react-bootstrap";
import { TopNav } from "../TopNav";
import "./AppLayout.scss";

declare const VERSION: string;

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Container>
        <TopNav />
        <div className="content">{children}</div>
      </Container>
      <footer className="footer">
        <span>client version: {VERSION}</span>
      </footer>
    </>
  );
};
