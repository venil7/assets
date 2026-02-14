import { useSignals } from "@preact/signals-react/runtime";
import { useHead } from "@unhead/react";
import { useEffect } from "react";
import { Users } from "../components/Users/Users";
import { useStore } from "../hooks/store";

const RawUsersScreen: React.FC = () => {
  useSignals();
  const { users } = useStore();

  useEffect(() => {
    users.load();
  }, [users]);

  useHead({ title: `Assets - Users` });

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
