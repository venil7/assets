import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { use, useEffect } from "react";
import { useParams } from "react-router";
import { withAuth } from "../decorators/auth";
import { StoreContext } from "../stores/store";

const RawAssetScreen: React.FC = () => {
  useSignals();
  const { assetDetails } = use(StoreContext);
  const { id, portfolioId } = useParams<{ id: string; portfolioId: string }>();

  useEffect(() => {
    assetDetails.load(+portfolioId!, +id!);
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
