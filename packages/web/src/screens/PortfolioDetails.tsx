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

  return (
    <PortfolioDetails
      details={pd.data.value}
      fetching={pd.fetching.value}
      error={pd.error.value}
    />
  );
};

export { RawPortfolioDetails as PortfolioDetailsScreen };
