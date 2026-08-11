import {
  adminPasswordChange,
  defaultNewUser,
  type GetUser,
  type NewUser,
  type PasswordChange,
  type PostUser,
  type UserId
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Table } from "react-bootstrap";
import { withAdminRestriction } from "../../decorators/admin";
import { withError, type WithError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { yesNo } from "../../util/yesno";
import { AddBtn } from "../Form/Button";
import { HorizontalStack } from "../Layout/Stack";
import { confirmationModal } from "../Modals/Confirmation";
import { passwordChangeModal } from "../Profile/PasswordChange";
import { UserMenu } from "./Menu";
import { newUserModal } from "./NewUser";
import { userProfileModal } from "./UserProfile";

type UsersProps = {
  users: GetUser[];
  onAdd: (p: NewUser) => void;
  onUpdate: (uid: UserId, p: PostUser) => void;
  onPasswordChange: (uid: UserId, p: PasswordChange) => void;
  onDelete: (uid: UserId) => void;
  disabled?: boolean;
};

const RawUsers: React.FC<UsersProps> = ({
  users,
  onAdd,
  onUpdate,
  onPasswordChange,
  onDelete,
  disabled
}: UsersProps) => {
  const handleProfileUpdate = (user: GetUser) =>
    pipe(
      () => userProfileModal(user),
      TE.map((updated) => onUpdate(user.id, updated))
    );

  const handlePasswordUpdate = (user: GetUser) =>
    pipe(
      () => passwordChangeModal(adminPasswordChange()),
      TE.map((password) => onPasswordChange(user.id, password))
    );

  const handleDelete = ({ id, username }: GetUser) =>
    pipe(
      () => confirmationModal(`Delete user '${username}'?`),
      TE.chainIOK(() => () => onDelete(id))
    );

  const handleAdd = pipe(() => newUserModal(defaultNewUser()), TE.map(onAdd));

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
            <th hidden={disabled}>&#xfe19;</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{yesNo(user.admin)}</td>
              <td>{yesNo(user.login_attempts > 3 || user.locked)}</td>
              <td>
                <UserMenu
                  onDelete={handleDelete(user)}
                  onEditProfile={handleProfileUpdate(user)}
                  onChangePassword={handlePasswordUpdate(user)}
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
  withNoData<UsersProps, "users">((p) => p.users?.length),
  withError<WithError<UsersProps>>,
  withAdminRestriction,
  withFetching
);
