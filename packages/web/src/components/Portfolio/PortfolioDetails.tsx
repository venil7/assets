import type { EnrichedPortfolio } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { useFormatters } from "../../hooks/prefs";
import { HorizontalStack } from "../Layout/Stack";

type PortfolioDetailsProps = {
  portfolio: EnrichedPortfolio;
};

export const PortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  portfolio,
}) => {
  const { money, decimal, percent } = useFormatters();
  return (
    <div className="portfolio-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Total cost</strong>
            <span>{money(portfolio.total_invested)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost (base)</strong>
            <span>{money(portfolio.investedBase)}</span>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Num assets</strong>
            <span>{decimal(portfolio.num_assets)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Net worth contribution</strong>
            <span>{percent(portfolio.contribution)}</span>
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
