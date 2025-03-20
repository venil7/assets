import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { withAuth } from "../decorators/auth";
import { useStore } from "../stores/store";

const RawPortfoliosDetails: React.FC = () => {
  useSignals();
  const { portfolioDetails } = useStore();
  const { id } = useParams();
  useEffect(() => {
    portfolioDetails.load(+id!);
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

const PortfolioDetailsScreen = pipe(RawPortfoliosDetails, withAuth);
export { PortfolioDetailsScreen };
