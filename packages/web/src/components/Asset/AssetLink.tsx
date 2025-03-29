import type { EnrichedAsset } from "@darkruby/assets-core";
import { Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { money } from "../../util/number";
import { PctIndicator, ValueIndicator } from "../Badge/Badges";
import { routes } from "../Router";
// import "./Portfolio.scss";

export type PortfolioLinkProps = {
  asset: EnrichedAsset;
};

export const AssetLink = ({ asset }: PortfolioLinkProps) => {
  return (
    <Card className="asset-link">
      <Card.Body>
        <Link to={routes.asset(asset.portfolio_id, asset.id)}>
          <Card.Title className="name">
            <Stack direction="horizontal">
              <div>{asset.name}</div>
              <div className="ms-auto">{money(asset.invested)}</div>
            </Stack>
          </Card.Title>
          <Card.Subtitle className="description">{asset.ticker}</Card.Subtitle>
        </Link>
      </Card.Body>
      <Card.Footer>
        <span className="float-end">
          Profit: <ValueIndicator value={asset.value.profitLoss} />
          Profit: <PctIndicator value={asset.price.periodChangePct} />
        </span>
      </Card.Footer>
    </Card>
  );
};
