import type { PostPortfolio } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Portfolios } from "../components/Portfolio/Portfolios";
import { useStore } from "../stores/store";

const RawPortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios, portfolio, asset, summary } = useStore();

  useEffect(() => {
    summary.load();
    portfolios.load();

    portfolio.reset();
    asset.reset();
  }, [portfolios]);

  const handleAdd = (p: PostPortfolio) => portfolios.create(p);
  const handleUpdate = (pid: number, p: PostPortfolio) =>
    portfolios.update(pid, p);
  const handleDelete = (pid: number) => portfolios.delete(pid);

  const handleRange = (range: ChartRange) => {
    portfolios.load(range);
    summary.load(range);
  };
  return (
    <Portfolios
      onAdd={handleAdd}
      onRange={handleRange}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      summary={summary.data.value}
      portfolios={portfolios.data.value}
      error={portfolios.error.value || summary.error.value}
      fetching={portfolios.fetching.value || summary.fetching.value}
    />
  );
};

export { RawPortfoliosScreen as PortfoliosScreen };
