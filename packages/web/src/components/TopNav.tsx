import type { Profile } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Container, Dropdown, DropdownButton, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import { withNoData } from "../decorators/nodata";
import { useStore } from "../stores/store";
import { NavCrumb } from "./Breadcrumb/Breadcrumb";

export const TopNav = () => {
  useSignals();
  const { profile, portfolio, asset } = useStore();

  useEffect(() => {
    profile.load();
  }, [profile]);

  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <NavCrumb portfolio={portfolio.data.value} asset={asset.data.value} />
        <Navbar.Collapse className="justify-content-end">
          <ProfileLink profile={profile.data.value} />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

const RawProfileLink: React.FC<{ profile: Profile }> = ({ profile }) => {
  return (
    <DropdownButton variant="dark" title={`@${profile.username}`}>
      <Dropdown.Item>
        <Link to="/profile">Profile</Link>
      </Dropdown.Item>
      <Dropdown.Item hidden={!profile.admin}>
        <Link to="/users">Users</Link>
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>
        <Link to="/logout">Logout</Link>
      </Dropdown.Item>
    </DropdownButton>
  );
};

const ProfileLink = pipe(
  RawProfileLink,
  withNoData((p) => p.profile, null)
);
