import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { use, useEffect } from "react";
import { useParams } from "react-router";
import { withAuth } from "../decorators/auth";
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

const AssetScreen = pipe(RawAssetScreen, withAuth);
export { AssetScreen };
