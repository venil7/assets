import type { EnrichedPortfolio } from "@darkruby/assets-core";
import { Badge, Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { money } from "../../util/number";
import { PctIndicator, ValueIndicator } from "../Badge/Badges";
import { routes } from "../Router";
import "./Portfolio.scss";

export type PortfolioLinkProps = {
  portfolio: EnrichedPortfolio;
};

export const PortfolioLink = ({ portfolio }: PortfolioLinkProps) => {
  return (
    <Card className="portfolio-link">
      <Card.Body>
        <Link to={routes.portfolio(portfolio.id)}>
          <Card.Title className="name">
            <Stack direction="horizontal">
              <div>{portfolio.name}</div>
              <div className="ms-auto">{money(portfolio.total_invested)}</div>
            </Stack>
          </Card.Title>
          <Card.Subtitle className="description">
            {portfolio.description}
          </Card.Subtitle>
        </Link>
      </Card.Body>
      <Card.Footer>
        <span className="float-end">
          Profit: <ValueIndicator value={portfolio.value.profitLoss} />
          Profit: <PctIndicator value={portfolio.price.periodChangePct} />
          Assets: <Badge bg="secondary">{portfolio.num_assets}</Badge>
        </span>
      </Card.Footer>
    </Card>
  );
};
