import {
  defaultPortfolio,
  type EnrichedPortfolio,
  type PostPortfolio,
} from "@darkruby/assets-core";
import {
  changeInValue,
  changeInValuePct,
  sum,
} from "@darkruby/assets-core/src/utils/finance";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Stack } from "react-bootstrap";
import { withError, type WithError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { AddBtn } from "../Form/Button";
import { HorizontalStack } from "../Layout/Stack";
import { Totals } from "../Totals/Totals";
import { PortfolioLink } from "./PortfolioLink";
import { portfolioModal } from "./PortfolioModal";

type PortfoliosProps = {
  portfolios: EnrichedPortfolio[];
  onAdd: (p: PostPortfolio) => void;
  onUpdate: (pid: number, p: PostPortfolio) => void;
  onDelete: (pid: number) => void;
};

const RawPortfolios: React.FC<PortfoliosProps> = ({
  portfolios,
  onAdd,
  onUpdate,
  onDelete,
}: PortfoliosProps) => {
  const handleAdd = () =>
    pipe(() => portfolioModal(defaultPortfolio()), TE.map(onAdd))();
  const handleUpdate = (pid: number) => (p: PostPortfolio) => onUpdate(pid, p);
  const handleDelete = (pid: number) => () => onDelete(pid);

  const currentValue = pipe(
    portfolios,
    sum((p) => p.value.current)
  );
  const investedValue = pipe(
    portfolios,
    sum((p) => p.investedBase)
  );
  const totalProfitLoss = changeInValue(investedValue)(currentValue);
  const totalProfitLossPct = changeInValuePct(investedValue)(currentValue);

  return (
    <div className="portfolios">
      <HorizontalStack className="top-toolbar">
        <AddBtn onClick={handleAdd} label="Portfolio" />
        <Totals
          value={currentValue}
          totals={{
            profitLoss: totalProfitLoss,
            profitLossPct: totalProfitLossPct,
          }}
        />
      </HorizontalStack>
      <Stack gap={3}>
        {portfolios.map((port) => (
          <PortfolioLink
            key={port.id}
            portfolio={port}
            onUpdate={handleUpdate(port.id)}
            onDelete={handleDelete(port.id)}
          />
        ))}
      </Stack>
    </div>
  );
};

export const Portfolios = pipe(
  RawPortfolios,
  withError<PortfoliosProps>,
  withNoData<WithError<PortfoliosProps>, "portfolios">(
    (p) => p.portfolios?.length
  ),
  withFetching
);
