import type { PostAsset, PostTx } from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { useParams } from "react-router";
import { Asset } from "../components/Asset/Asset";
import { StoreContext } from "../stores/store";

const RawAssetScreen: React.FC = () => {
  useSignals();
  const { asset, txs, portfolio } = use(StoreContext);
  const { assetId, portfolioId } = useParams<{
    assetId: string;
    portfolioId: string;
  }>();

  useEffect(() => {
    portfolio.load(+portfolioId!);
    asset.load(+portfolioId!, +assetId!);
    txs.load(+assetId!);
  }, [asset]);

  const handleEdit = (a: PostAsset) =>
    asset.update(+portfolioId!, +assetId!, a);
  const handleAddTx = (tx: PostTx) => txs.create(+assetId!, tx);
  const handleEditTx = (txid: number, tx: PostTx) =>
    txs.update(+assetId!, txid, tx);
  const handleDeleteTx = (txid: number) => txs.delete(+assetId!, txid);
  const handleRange = (rng: ChartRange) =>
    asset.load(+portfolioId!, +assetId!, rng);

  return (
    <>
      <Asset
        onEdit={handleEdit}
        txs={txs.data.value}
        onRange={handleRange}
        onAddTx={handleAddTx}
        onEditTx={handleEditTx}
        asset={asset.data.value}
        error={asset.error.value}
        onDeleteTx={handleDeleteTx}
        fetching={asset.fetching.value}
      />
    </>
  );
};

export { RawAssetScreen as AssetScreen };
