import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { useParams } from "react-router";
import { StoreContext } from "../stores/store";

const RawAssetScreen: React.FC = () => {
  useSignals();
  const { asset } = use(StoreContext);
  const { assetId, portfolioId } = useParams<{
    assetId: string;
    portfolioId: string;
  }>();

  useEffect(() => {
    asset.load(+portfolioId!, +assetId!);
  }, [asset]);

  return (
    <>
      <h5>{asset.data.value?.name}</h5>
      <pre>{JSON.stringify(asset.data.value, null, 2)}</pre>
    </>
  );
};

export { RawAssetScreen as AssetScreen };
