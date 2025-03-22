import type { GetPortfolio } from "@darkruby/assets-core";
import { Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { money } from "../../util/number";
import { routes } from "../Router";
import "./Portfolio.scss";

export type PortfolioLinkProps = {
  portfolio: GetPortfolio;
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
        <span className="float-end">Assets {portfolio.num_assets}</span>
      </Card.Footer>
    </Card>
  );
};
