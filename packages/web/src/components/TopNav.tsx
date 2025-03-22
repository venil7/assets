import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router";

export const TopNav = () => {
  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Link to="/">
          <Navbar.Brand>Navbar with text</Navbar.Brand>
        </Link>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            Signed in as: <Link to="/logout">Mark Otto</Link>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
