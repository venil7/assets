import type { PostPortfolio } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Portfolios } from "../components/Portfolio/Portfolios";
import { useStore } from "../hooks/store";

const RawPortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios, portfolio, asset, summary } = useStore();

  const error =
    portfolios.error.value ||
    portfolio.error.value ||
    asset.error.value ||
    summary.error.value;

  const fetching = portfolios.fetching.value || summary.fetching.value;

  const load = () => {
    summary.load();
    portfolios.load();

    portfolio.reset();
    asset.reset();
  };

  useEffect(() => {
    load();
  }, [summary, portfolios]);

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
      error={error}
      onAdd={handleAdd}
      fetching={fetching}
      onRange={handleRange}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      summary={summary.data.value}
      portfolios={portfolios.data.value}
      onErrorDismiss={load}
    />
  );
};

export { RawPortfoliosScreen as PortfoliosScreen };
