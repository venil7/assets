import type { PropsWithChildren } from "react";
import { Container } from "react-bootstrap";
import { TopNav } from "../TopNav";
import "./AppLayout.scss";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Container>
        <TopNav />
        <div className="content">{children}</div>
      </Container>
      <footer className="footer">
        <span>
          Assets v{APP_VERSION}@{APP_GIT_HASH}, built {BUILD_DATE}, runtime v
          {BUN_VERSION}
        </span>
      </footer>
    </>
  );
};
