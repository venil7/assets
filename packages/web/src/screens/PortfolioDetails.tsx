import type { PostAsset, PostPortfolio } from "@darkruby/assets-core";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { useParams } from "react-router";
import { PortfolioDetails } from "../components/Portfolio/PortfolioDetails";
import { useStore } from "../stores/store";

const RawPortfolioDetails: React.FC = () => {
  useSignals();
  const { portfolioDetails: pd } = useStore();
  const { portfolioId } = useParams<{ portfolioId: string }>();
  useEffect(() => {
    pd.load(+portfolioId!);
  }, [pd]);

  const handleUpdate = (p: PostPortfolio) => pd.update(+portfolioId!, p);
  const handleAddAsset = (p: PostAsset) => pd.addAsset(+portfolioId!, p);
  const handleDeleteAsset = (aid: number) => pd.deleteAsset(+portfolioId!, aid);
  const handleUpdateAsset = (aid: number, a: PostAsset) =>
    pd.updateAsset(+portfolioId!, aid, a);

  return (
    <PortfolioDetails
      error={pd.error.value}
      onUpdate={handleUpdate}
      details={pd.data.value}
      onAddAsset={handleAddAsset}
      fetching={pd.fetching.value}
      onDeleteAsset={handleDeleteAsset}
      onUpdateAsset={handleUpdateAsset}
    />
  );
};

export { RawPortfolioDetails as PortfolioDetailsScreen };
