import {
  defaultPortfolio,
  type EnrichedPortfolio,
  type PostPortfolio,
  type Summary,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Stack } from "react-bootstrap";
import { withError, type WithError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { RangeChart } from "../Charts/RangesChart";
import { Info } from "../Form/Alert";
import { AddBtn } from "../Form/Button";
import { HorizontalStack } from "../Layout/Stack";
import { Totals } from "../Totals/Totals";
import { PortfolioLink } from "./PortfolioLink";
import { portfolioModal } from "./PortfolioModal";

type PortfoliosProps = {
  summary: Summary;
  portfolios: EnrichedPortfolio[];
  onRange: (r: ChartRange) => void;
  onAdd: (p: PostPortfolio) => void;
  onUpdate: (pid: number, p: PostPortfolio) => void;
  onDelete: (pid: number) => void;
};

const RawPortfolios: React.FC<PortfoliosProps> = ({
  portfolios,
  summary,
  onAdd,
  onUpdate,
  onDelete,
  onRange,
}: PortfoliosProps) => {
  const handleAdd = () =>
    pipe(() => portfolioModal(defaultPortfolio()), TE.map(onAdd))();
  const handleUpdate = (pid: number) => (p: PostPortfolio) => onUpdate(pid, p);
  const handleDelete = (pid: number) => () => onDelete(pid);

  return (
    <div className="portfolios">
      <HorizontalStack className="top-toolbar">
        <AddBtn onClick={handleAdd} label="Portfolio" />
        <Totals value={summary.value.current} totals={summary.value} />
      </HorizontalStack>

      <Info hidden={!!portfolios.length}>No portfolios yet</Info>

      <RangeChart
        onChange={onRange}
        data={summary.chart}
        range={summary.meta.range}
        ranges={summary.meta.validRanges}
        hidden={!portfolios.length}
      />

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
  withNoData<WithError<PortfoliosProps>, "summary">((p) => p.summary),
  withFetching
);
