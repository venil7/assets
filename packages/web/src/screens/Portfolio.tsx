import {
  postAssetEq,
  type PostAsset,
  type PostPortfolio,
  type PostTx
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { useHead } from "@unhead/react";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect } from "react";

import type { Predicate } from "fp-ts/lib/Predicate";
import { useNavigate } from "react-router";
import { Portfolio } from "../components/Portfolio/Portfolio";
import { routes } from "../components/Router";
import { usePortfolioParams } from "../hooks/params";
import { useStore } from "../hooks/store";

const RawPortfolio: React.FC = () => {
  useSignals();
  const navigate = useNavigate();

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

  const handleAddAsset = (asset: PostAsset) => {
    assets.create(portfolioId, asset).then(
      E.map(
        flow(
          A.findFirst(postAssetEq.equals as Predicate<PostAsset>),
          O.map(({ id }) => navigate(routes.asset(portfolioId, id)))
        )
      )
    );
  };
  const handleUpdate = (p: PostPortfolio) => portfolio.update(portfolioId, p);
  const handleDeleteAsset = (aid: number) => assets.delete(portfolioId, aid);
  const handleUpdateAsset = (aid: number, a: PostAsset) =>
    assets.update(portfolioId, aid, a);
  const handleMoveAsset = (aid: number, npid: number) =>
    assets.move(portfolioId, aid, npid);
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
        onMoveAsset={handleMoveAsset}
        onErrorDismiss={load}
      />
    </>
  );
};

export { RawPortfolio as PortfolioScreen };
