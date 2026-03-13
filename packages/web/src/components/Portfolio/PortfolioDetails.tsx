import type { EnrichedPortfolio } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Decimal, Money, Percent } from "../Formatting";
import { BasicList } from "../Formatting/BasicList";
import { HorizontalStack } from "../Layout/Stack";

type PortfolioDetailsProps = {
  portfolio: EnrichedPortfolio;
};

export const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  portfolio
}) => {
  return (
    <div className="portfolio-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Num assets</strong>
            <Decimal value={portfolio.num_assets} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Types</strong>
            <BasicList items={portfolio.meta.types} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Exchanges</strong>
            <BasicList items={portfolio.meta.exchanges} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Currencies</strong>
            <BasicList items={portfolio.meta.currencies} />
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>52wk max</strong>
            <Money value={portfolio.meta.fiftyTwoWeekHigh} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>52wk min</strong>
            <Money value={portfolio.meta.fiftyTwoWeekLow} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Range</strong>
            <Money value={portfolio.meta.volatilityRange} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Volatility</strong>
            <Percent value={portfolio.meta.volatilityPct} nocolor />
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>FX impact</strong>
            <Money value={portfolio.fxImpact} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost</strong>
            <Money value={null} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost</strong>
            <Money value={portfolio.invested} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain</strong>
            <Money value={portfolio.realizedPnl} />
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
