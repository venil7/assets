import { useSignals } from "@preact/signals-react/runtime";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";
import { Link } from "react-router";
import { withAuth } from "../decorators/auth";
import { useStore } from "../stores/store";

const RawPortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios } = useStore();

  useEffect(() => {
    portfolios.load();
  }, [portfolios]);

  return (
    <ul>
      {portfolios.data.value.map((port) => (
        <li key={port.id}>
          <Link to={`/portfolio/${port.id}`}>
            {port.name} - £{port.total_invested}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const PortfoliosScreen = pipe(RawPortfoliosScreen, withAuth);
export { PortfoliosScreen };
