import {
  defaultCredentials,
  fromProfile,
  type Credentials,
  type Profile,
  type UserId,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Table } from "react-bootstrap";
import { withError, type WithError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { yesNo } from "../../util/yesno";
import { AddBtn } from "../Form/Button";
import { HorizontalStack } from "../Layout/Stack";
import { confirmationModal } from "../Modals/Confirmation";
import { PortfolioMenu } from "../Portfolio/Menu";
import { credentialsModal } from "../Profile/CredentialsModal";

type UsersProps = {
  users: Profile[];
  onAdd: (p: Credentials) => void;
  onUpdate: (uid: UserId, p: Credentials) => void;
  onDelete: (uid: UserId) => void;
};

const RawUsers: React.FC<UsersProps> = ({
  users,
  onAdd,
  onUpdate,
  onDelete,
}: UsersProps) => {
  const handleUpdate = (p: Profile) =>
    pipe(
      () => credentialsModal(fromProfile(p)),
      TE.map((pwd) => onUpdate(p.id, pwd))
    );
  const handleDelete = (uid: UserId) =>
    pipe(
      () => confirmationModal(`Delete user?`),
      TE.chainIOK(() => () => onDelete(uid))
    );

  const handleAdd = pipe(
    () => credentialsModal(defaultCredentials()),
    TE.map(onAdd)
  );

  return (
    <div className="users">
      <HorizontalStack className="top-toolbar spread-container">
        <AddBtn onClick={handleAdd} label="User" />
      </HorizontalStack>
      <Table responsive={false} striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Admin</th>
            <th>Locked</th>
            <th>^</th>
          </tr>
        </thead>
        <tbody>
          {users.map((profile) => (
            <tr key={profile.id}>
              <td>{profile.id}</td>
              <td>{profile.username}</td>
              <td>{yesNo(profile.admin)}</td>
              <td>{yesNo(profile.login_attempts > 3 || profile.locked)}</td>
              <td>
                <PortfolioMenu
                  onDelete={handleDelete(profile.id)}
                  onEdit={handleUpdate(profile)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export const Users = pipe(
  RawUsers,
  withError<UsersProps>,
  withNoData<WithError<UsersProps>, "users">((p) => p.users?.length),
  withFetching
);
