import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Portfolios } from "../components/Portfolio/Portfolios";
import { useStore } from "../stores/store";

const RawPortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios } = useStore();

  useEffect(() => {
    portfolios.load();
  }, [portfolios]);

  return (
    <Portfolios
      portfolios={portfolios.data.value}
      fetching={portfolios.fetching.value}
      error={portfolios.error.value}
    />
  );
};

export { RawPortfoliosScreen as PortfoliosScreen };
