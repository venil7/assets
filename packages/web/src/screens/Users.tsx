import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Users } from "../components/Users/Users";
import { withAdminRestriction } from "../decorators/admin";
import { useStore } from "../stores/store";

const RawUsersScreen: React.FC = () => {
  useSignals();
  const { users } = useStore();

  useEffect(() => {
    users.load();
  }, [users]);

  return (
    <Users
      onAdd={users.create}
      onUpdate={users.update}
      onDelete={users.delete}
      users={users.data.value}
      error={users.error.value}
      fetching={users.fetching.value}
    />
  );
};

const UsersScreen = pipe(RawUsersScreen, withAdminRestriction);
export { UsersScreen };
