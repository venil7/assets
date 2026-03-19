import {
  defaultPortfolio,
  type EnrichedPortfolio,
  type EnrichedSummary,
  type PostPortfolio
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Stack } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData, type WithNoData } from "../../decorators/nodata";
import { AssetChart } from "../Charts";
import { Info } from "../Form/Alert";
import { AddBtn } from "../Form/Button";
import { TabContent, Tabs } from "../Form/Tabs";
import { HorizontalStack } from "../Layout/Stack";
import { portfolioModal } from "../Portfolio/PortfolioFields";
import { PortfolioLink } from "../Portfolio/PortfolioLink";
import { Totals } from "../Totals/Totals";
import { SummaryDetails } from "./SummaryDetails";

type SummaryProps = {
  summary: EnrichedSummary;
  portfolios: EnrichedPortfolio[];
  onRange: (r: ChartRange) => void;
  onAdd: (p: PostPortfolio) => void;
  onUpdate: (pid: number, p: PostPortfolio) => void;
  onDelete: (pid: number) => void;
};

const RawSummary: React.FC<SummaryProps> = ({
  portfolios,
  summary,
  onAdd,
  onUpdate,
  onDelete,
  onRange
}: SummaryProps) => {
  const handleAdd = () =>
    pipe(() => portfolioModal(defaultPortfolio()), TE.map(onAdd))();
  const handleUpdate = (pid: number) => (p: PostPortfolio) => onUpdate(pid, p);
  const handleDelete = (pid: number) => () => onDelete(pid);

  return (
    <div className="portfolios">
      <HorizontalStack className="top-toolbar">
        <AddBtn onClick={handleAdd} label="Portfolio" />
        <Totals
          totals={summary.totals}
          change={summary.changes}
          range={summary.meta.range}
        />
      </HorizontalStack>

      <Info hidden={!!portfolios.length}>No portfolios yet</Info>

      <Tabs tabs={["Chart", "Details"]} hidden={!portfolios.length}>
        <TabContent tab={0}>
          <AssetChart
            onChange={onRange}
            data={summary.chart}
            range={summary.meta.range}
            ranges={summary.meta.validRanges}
            hidden={!portfolios.length}
          />
        </TabContent>
        <TabContent tab={1}>
          <SummaryDetails summary={summary} />
        </TabContent>
      </Tabs>

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

export const Summary = pipe(
  RawSummary,
  withNoData<SummaryProps, "portfolios">((p) => p.portfolios?.length),
  withNoData<SummaryProps, "summary">((p) => p.summary),
  withError<WithNoData<SummaryProps, "summary">>,
  withFetching
);
