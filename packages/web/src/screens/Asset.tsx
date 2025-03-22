import { useSignals } from "@preact/signals-react/runtime";
import { use, useEffect } from "react";
import { useParams } from "react-router";
import { StoreContext } from "../stores/store";

const RawAssetScreen: React.FC = () => {
  useSignals();
  const { assetDetails } = use(StoreContext);
  const { assetId, portfolioId } = useParams<{
    assetId: string;
    portfolioId: string;
  }>();

  useEffect(() => {
    assetDetails.load(+portfolioId!, +assetId!);
  }, [assetDetails]);

  return (
    <>
      <h5>{assetDetails.data.value?.name}</h5>
      <pre>{JSON.stringify(assetDetails.data.value, null, 2)}</pre>
    </>
  );
};

export { RawAssetScreen as AssetScreen };
