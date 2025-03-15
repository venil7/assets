import { useSignals } from "@preact/signals-react/runtime";
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StoreContext } from "../components/App";

export const PortfoliosScreen: React.FC = () => {
  useSignals();
  const { portfolios } = useContext(StoreContext);
  const { id = 1 } = useParams();

  useEffect(() => {
    portfolios.load();
  }, [portfolios, id]);

  return (
    // <Character
    //   character={character.data.value}
    //   fetching={character.fetching.value}
    //   error={character.error.value}
    // />
    <ul>
      {portfolios.data.value.map((port) => (
        <li>
          {port.name} - £{port.total_invested}
        </li>
      ))}
    </ul>
  );
};
