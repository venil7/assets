import type { EnrichedSummary } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Decimal, Money, Percent } from "../Formatting";
import { BasicList } from "../Formatting/BasicList";
import { HorizontalStack } from "../Layout/Stack";

type SummaryDetailsProps = {
  summary: EnrichedSummary;
};

export const SummaryDetails: React.FC<SummaryDetailsProps> = ({ summary }) => {
  return (
    <div className="summary-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Num portfolios</strong>
            <Decimal value={summary.numPortfolios} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Types</strong>
            <BasicList items={summary.meta.types} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Exchanges</strong>
            <BasicList items={summary.meta.exchanges} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Currencies</strong>
            <BasicList items={summary.meta.currencies} />
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>52wk max</strong>
            <Money value={summary.meta.fiftyTwoWeekHigh} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>52wk min</strong>
            <Money value={summary.meta.fiftyTwoWeekLow} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Range</strong>
            <Money value={summary.meta.volatilityRange} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Volatility</strong>
            <Percent value={summary.meta.volatilityPct} nocolor />
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>FX impact</strong>
            <Money value={summary.fxImpact} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost</strong>
            <Money value={null} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost</strong>
            <Money value={summary.invested} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain</strong>
            <Money value={summary.realizedPnl} />
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
