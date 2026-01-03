import type { Profile } from "@darkruby/assets-core";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Container, Dropdown, DropdownButton, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import { withNoData } from "../decorators/nodata";
import { withProps } from "../decorators/props";
import { useStore } from "../hooks/store";
import { NavCrumb } from "./Breadcrumb/Breadcrumb";
import { LabeledIcon } from "./Icons/Xs";

export const UserIconLabel = pipe(
  LabeledIcon,
  withProps({ icon: faUserCircle })
);

export const TopNav = () => {
  useSignals();
  const { profile, portfolio, prefs, asset } = useStore();

  useEffect(() => {
    profile.load();
    prefs.load();
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
    <DropdownButton
      variant="dark"
      title={<UserIconLabel label={profile.username} />}
    >
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
