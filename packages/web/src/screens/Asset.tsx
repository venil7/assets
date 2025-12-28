import type {
  PostAsset,
  PostTx,
  PostTxsUpload,
  TxId,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { Asset } from "../components/Asset/Asset";
import { useAssetParams } from "../hooks/params";
import { StoreContext } from "../hooks/store";

const RawAssetScreen: React.FC = () => {
  useSignals();
  const { asset, txs, portfolio } = use(StoreContext);
  const { assetId, portfolioId } = useAssetParams();

  useEffect(() => {
    portfolio.load(portfolioId);
    asset.load(portfolioId, assetId);
    txs.load(assetId);
  }, [asset]);

  const handleEdit = (a: PostAsset) => asset.update(portfolioId, assetId, a);

  const handleAddTx = async (tx: PostTx) => {
    await txs.create(assetId, tx);
    asset.load(portfolioId, assetId);
  };
  const handleEditTx = async (txid: TxId, tx: PostTx) => {
    await txs.update(assetId, txid, tx);
    asset.load(portfolioId, assetId);
  };

  const handleDeleteTx = async (txid: TxId) => {
    await txs.delete(assetId, txid);
    asset.load(portfolioId, assetId);
  };

  const handleDeleteAllTxs = async () => {
    await txs.deleteAllAsset(assetId);
    asset.load(portfolioId, assetId);
  };

  const handleUploadAssetTxs = async (upload: PostTxsUpload) => {
    await txs.upload(assetId, upload);
    asset.load(portfolioId, assetId);
  };

  const handleRange = (rng: ChartRange) =>
    asset.load(portfolioId, assetId, rng);

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
        onDeleteAll={handleDeleteAllTxs}
        onUploadTxs={handleUploadAssetTxs}
      />
    </>
  );
};

export { RawAssetScreen as AssetScreen };
