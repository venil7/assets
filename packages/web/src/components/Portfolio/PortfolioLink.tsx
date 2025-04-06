import type { EnrichedPortfolio, PostPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Badge, Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { PctIndicator } from "../Badge/Badges";
import { confirmationModal } from "../Modals/Confirmation";
import { routes } from "../Router";
import { Totals } from "../Totals/Totals";
import { PortfolioMenu } from "./Menu";
import "./Portfolio.scss";
import { portfolioModal } from "./PortfolioModal";

export type PortfolioLinkProps = {
  portfolio: EnrichedPortfolio;
  onUpdate: (p: PostPortfolio) => void;
  onDelete: () => void;
};

export const PortfolioLink = ({
  portfolio,
  onUpdate,
  onDelete,
}: PortfolioLinkProps) => {
  const handleUpdate = pipe(() => portfolioModal(portfolio), TE.map(onUpdate));
  const handleDelete = pipe(
    () => confirmationModal(`Delete '${portfolio.name}'?`),
    TE.map(onDelete)
  );

  return (
    <Card className="portfolio-link">
      <Card.Body>
        <Link to={routes.portfolio(portfolio.id)}>
          <Card.Title className="name">
            <Stack direction="horizontal">
              <div>{portfolio.name}</div>
              <div className="ms-auto">
                <Totals value={portfolio.value} totals={portfolio.totals} />
              </div>
            </Stack>
          </Card.Title>
          <Card.Subtitle className="description">
            {portfolio.description}
          </Card.Subtitle>
        </Link>
      </Card.Body>
      <Card.Footer>
        <span className="start">
          Assets: <Badge bg="secondary">{portfolio.num_assets}</Badge>
        </span>
        {/* <span>
          Profit: <ValueIndicator value={portfolio.totals.profitLoss} />
        </span> */}
        <span>
          <PctIndicator value={portfolio.value.changePct} />
        </span>
        <span>
          <PortfolioMenu onDelete={handleDelete} onEdit={handleUpdate} />
        </span>
      </Card.Footer>
    </Card>
  );
};
