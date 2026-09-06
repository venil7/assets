import { postPortfolioEq, type PostPortfolio } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { useHead } from "@unhead/react";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import type { Predicate } from "fp-ts/lib/Predicate";
import { flow } from "fp-ts/lib/function";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { routes } from "../components/Router";
import { Summary } from "../components/Summary/Summary";
import { useStore } from "../hooks/store";

const RawPortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios, portfolio, asset, summary } = useStore();
  const navigate = useNavigate();
  const error = portfolios.error.value || summary.error.value;
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

  const handleAdd = (portfolio: PostPortfolio) => {
    portfolios.create(portfolio).then(
      E.map(
        flow(
          A.findFirst(postPortfolioEq.equals as Predicate<PostPortfolio>),
          O.map(({ id }) => navigate(routes.portfolio(id)))
        )
      )
    );
  };

  const handleUpdate = (pid: number, p: PostPortfolio) =>
    portfolios.update(pid, p);
  const handleDelete = (pid: number) => portfolios.delete(pid);

  const handleRange = (range: ChartRange) => {
    portfolios.load(range);
    summary.load(range);
  };

  useHead({ title: "Assets - Home" });

  return (
    <>
      <Summary
        error={error}
        onAdd={handleAdd}
        fetching={fetching}
        onRange={handleRange}
        onErrorDismiss={load}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        summary={summary.data.value}
        portfolios={portfolios.data.value}
      />
    </>
  );
};

export { RawPortfoliosScreen as PortfoliosScreen };
