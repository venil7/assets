import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Users } from "../components/Users/Users";
import { useStore } from "../hooks/store";

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

export { RawUsersScreen as UsersScreen };
