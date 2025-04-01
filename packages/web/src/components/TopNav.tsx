import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import { useStore } from "../stores/store";

export const TopNav = () => {
  useSignals();
  const { profile } = useStore();

  useEffect(() => {
    profile.load();
  }, [profile]);

  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Link to="/">
          <Navbar.Brand>Asset mgmt.</Navbar.Brand>
        </Link>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            @<Link to="/logout">{profile.data.value?.username}</Link>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
