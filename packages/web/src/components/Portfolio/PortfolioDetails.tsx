import type { EnrichedPortfolio } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Decimal, Money } from "../Formatting";
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
            <strong>{portfolio.description}</strong>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Num assets</strong>
            <Decimal value={portfolio.num_assets} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost</strong>
            <Money value={portfolio.invested} />
          </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Currencies</strong>
            <span>{portfolio.currencies.join(", ")}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain</strong>
            <Money value={portfolio.realizedPnl} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>FX impact</strong>
            <Money value={portfolio.fxImpact} />
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
