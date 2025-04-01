import type { EnrichedPortfolio, PostPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Badge, Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { money } from "../../util/number";
import { PctIndicator, ValueIndicator } from "../Badge/Badges";
import { confirmationModal } from "../Modals/Confirmation";
import { routes } from "../Router";
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
  const handleUpdate = () =>
    pipe(() => portfolioModal(portfolio), TE.map(onUpdate))();
  const handleDelete = () =>
    pipe(
      () => confirmationModal(`Delete portfolio ${portfolio.name}?`),
      TE.map(onDelete)
    )();

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
        <span className="start">
          Assets: <Badge bg="secondary">{portfolio.num_assets}</Badge>
        </span>
        <span>
          Profit: <ValueIndicator value={portfolio.value.totalProfitLoss} />
        </span>
        <span>
          Period Change:
          <PctIndicator value={portfolio.value.periodChangePct} />
        </span>
        <span>
          <PortfolioMenu onDelete={handleDelete} onEdit={handleUpdate} />
        </span>
      </Card.Footer>
    </Card>
  );
};
