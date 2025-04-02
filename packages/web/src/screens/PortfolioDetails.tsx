import type { PostAsset, PostPortfolio, PostTx } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect } from "react";
import { useParams } from "react-router";
import { PortfolioDetails } from "../components/Portfolio/PortfolioDetails";
import { useStore } from "../stores/store";

const RawPortfolioDetails: React.FC = () => {
  useSignals();
  const { portfolio, assets, txs } = useStore();
  const { portfolioId } = useParams<{ portfolioId: string }>();
  useEffect(() => {
    portfolio.load(+portfolioId!);
    assets.load(+portfolioId!);
  }, [portfolio]);

  const handleUpdate = (p: PostPortfolio) => portfolio.update(+portfolioId!, p);
  const handleAddAsset = (p: PostAsset) => assets.create(+portfolioId!, p);
  const handleDeleteAsset = (aid: number) => assets.delete(+portfolioId!, aid);
  const handleUpdateAsset = (aid: number, a: PostAsset) =>
    assets.update(+portfolioId!, aid, a);
  const handleAddTx = (aid: number, t: PostTx) =>
    pipe(
      () => txs.create(aid, t),
      TE.chain(() => () => portfolio.load(+portfolioId!))
    )();

  return (
    <PortfolioDetails
      onAddTx={handleAddTx}
      onUpdate={handleUpdate}
      assets={assets.data.value}
      onAddAsset={handleAddAsset}
      portfolio={portfolio.data.value}
      onDeleteAsset={handleDeleteAsset}
      onUpdateAsset={handleUpdateAsset}
      fetching={portfolio.fetching.value}
      error={portfolio.error.value || assets.error.value}
    />
  );
};

export { RawPortfolioDetails as PortfolioDetailsScreen };
