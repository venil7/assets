import type { PostAsset, PostPortfolio, PostTx } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { useHead } from "@unhead/react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useState } from "react";

import { Portfolio } from "../components/Portfolio/Portfolio";
import { usePortfolioParams } from "../hooks/params";
import { useStore } from "../hooks/store";

const RawPortfolio: React.FC = () => {
  useSignals();
  const [title, setTitle] = useState("Loading..");

  const { portfolio, assets, asset, txs } = useStore();
  const error = portfolio.error.value || assets.error.value;

  const fetching =
    portfolio.fetching.value ||
    assets.fetching.value ||
    asset.fetching.value ||
    txs.fetching.value;

  const load = () => {
    asset.reset();

    portfolio.load(portfolioId);
    assets.load(portfolioId);
  };

  const { portfolioId } = usePortfolioParams();
  useEffect(() => {
    load();
  }, [assets, portfolio]);

  const handleUpdate = (p: PostPortfolio) => portfolio.update(portfolioId, p);
  const handleAddAsset = (p: PostAsset) => assets.create(portfolioId, p);
  const handleDeleteAsset = (aid: number) => assets.delete(portfolioId, aid);
  const handleUpdateAsset = (aid: number, a: PostAsset) =>
    assets.update(portfolioId, aid, a);
  const handleAddTx = (aid: number, t: PostTx) =>
    pipe(
      () => txs.create(portfolioId, aid, t),
      TE.chain(() => () => portfolio.load(portfolioId))
    )();
  const handleRange = (range: ChartRange) => {
    portfolio.load(portfolioId, range);
    assets.load(portfolioId, range);
  };

  useHead({ title: `Assets - ${portfolio.data.value?.name || "Portfolio"}` });

  return (
    <>
      <Portfolio
        error={error}
        fetching={fetching}
        onAddTx={handleAddTx}
        onRange={handleRange}
        onUpdate={handleUpdate}
        assets={assets.data.value}
        onAddAsset={handleAddAsset}
        portfolio={portfolio.data.value}
        onDeleteAsset={handleDeleteAsset}
        onUpdateAsset={handleUpdateAsset}
        onErrorDismiss={load}
      />
    </>
  );
};

export { RawPortfolio as PortfolioScreen };
