import type { PostPortfolio } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Portfolios } from "../components/Portfolio/Portfolios";
import { useStore } from "../stores/store";

const RawPortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios } = useStore();

  useEffect(() => {
    portfolios.load();
  }, [portfolios]);

  const handleAdd = (p: PostPortfolio) => portfolios.create(p);
  const handleUpdate = (pid: number, p: PostPortfolio) =>
    portfolios.update(pid, p);
  const handleDelete = (pid: number) => portfolios.delete(pid);
  return (
    <Portfolios
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      error={portfolios.error.value}
      portfolios={portfolios.data.value}
      fetching={portfolios.fetching.value}
    />
  );
};

export { RawPortfoliosScreen as PortfoliosScreen };
