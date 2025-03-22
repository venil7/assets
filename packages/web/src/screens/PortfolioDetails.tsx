import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useStore } from "../stores/store";

const RawPortfoliosDetails: React.FC = () => {
  useSignals();
  const { portfolioDetails } = useStore();
  const { portfolioId } = useParams<{ portfolioId: string }>();
  useEffect(() => {
    portfolioDetails.load(+portfolioId!);
  }, [portfolioDetails]);

  return (
    <>
      <h5>portfolio dtails</h5>
      <pre>{JSON.stringify(portfolioDetails.data.value, null, 2)}</pre>
      <ul>
        {portfolioDetails.data.value?.assets.map((ass) => (
          <li>
            <Link to={`/portfolio/${ass.portfolio_id}/asset/${ass.id}`}>
              {ass.name} - £{ass.avg_price}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export { RawPortfoliosDetails as PortfolioDetailsScreen };
