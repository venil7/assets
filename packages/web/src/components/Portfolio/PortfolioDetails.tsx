import type { EnrichedPortfolio } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { useFormatters } from "../../hooks/prefs";
import { HorizontalStack } from "../Layout/Stack";

type PortfolioDetailsProps = {
  portfolio: EnrichedPortfolio;
};

export const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  portfolio
}) => {
  const { money, decimal, percent } = useFormatters();
  return (
    <div className="portfolio-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>{portfolio.description}</strong>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Num assets</strong>
            <span>{decimal(portfolio.num_assets)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost (base)</strong>
            <span>{money(portfolio.base.invested)}</span>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Currencies</strong>
            <span>{portfolio.currencies.join(", ")}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain (base)</strong>
            <span>
              {money(portfolio.base.realizedGain)} (
              {percent(portfolio.base.realizedGainPct)})
            </span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Unrealized FX impact</strong>
            <span>{money(portfolio.base.fxImpact)}</span>
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
