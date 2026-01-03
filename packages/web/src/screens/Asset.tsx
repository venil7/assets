import type {
  Action,
  PostAsset,
  PostTx,
  PostTxsUpload,
  TxId,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { use, useEffect } from "react";
import { Asset } from "../components/Asset/Asset";
import { useAssetParams } from "../hooks/params";
import { StoreContext } from "../hooks/store";

const RawAssetScreen: React.FC = () => {
  useSignals();
  const { asset, txs, portfolio } = use(StoreContext);
  const { assetId, portfolioId } = useAssetParams();
  const error = asset.error.value || portfolio.error.value || txs.error.value;
  const fetching =
    asset.fetching.value || portfolio.fetching.value || txs.fetching.value;
  const load = () => {
    portfolio.load(portfolioId);
    asset.load(portfolioId, assetId);
    txs.load(assetId);
  };

  useEffect(() => {
    load();
  }, [asset, portfolio, txs]);

  function reloadAsset<T>(action: Action<T>) {
    return pipe(
      action,
      TE.chain(() => () => asset.load(portfolioId, assetId))
    )();
  }

  const handleEdit = (a: PostAsset) =>
    reloadAsset(() => asset.update(portfolioId, assetId, a));

  const handleAddTx = (tx: PostTx) =>
    reloadAsset(() => txs.create(assetId, tx));

  const handleEditTx = (txid: TxId, tx: PostTx) =>
    reloadAsset(() => txs.update(assetId, txid, tx));

  const handleDeleteTx = (txid: TxId) =>
    reloadAsset(() => txs.delete(assetId, txid));

  const handleDeleteAllTxs = () =>
    reloadAsset(() => txs.deleteAllAsset(assetId));

  const handleUploadAssetTxs = async (upload: PostTxsUpload) =>
    reloadAsset(() => txs.upload(assetId, upload));

  const handleRange = (rng: ChartRange) =>
    asset.load(portfolioId, assetId, rng);

  return (
    <>
      <Asset
        error={error}
        fetching={fetching}
        onEdit={handleEdit}
        txs={txs.data.value}
        onRange={handleRange}
        onAddTx={handleAddTx}
        onEditTx={handleEditTx}
        asset={asset.data.value}
        onDeleteTx={handleDeleteTx}
        onDeleteAll={handleDeleteAllTxs}
        onUploadTxs={handleUploadAssetTxs}
        onErrorDismiss={load}
      />
    </>
  );
};

export { RawAssetScreen as AssetScreen };
