import type { EnrichedAsset, PostAsset } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { money } from "../../util/number";
import { PctIndicator, ValueIndicator } from "../Badge/Badges";
import { confirmationModal } from "../Modals/Confirmation";
import { routes } from "../Router";
import "./Asset.scss";
import { assetModal } from "./AssetModal";

export type PortfolioLinkProps = {
  asset: EnrichedAsset;
  onUpdate: (a: PostAsset) => void;
  onDelete: () => void;
};

export const AssetLink = ({
  asset,
  onUpdate,
  onDelete,
}: PortfolioLinkProps) => {
  const handleUpdate = () => pipe(() => assetModal(asset), TE.map(onUpdate));
  const handleDelete = () =>
    pipe(
      () => confirmationModal(`Delete portfolio ${asset.name}?`),
      TE.map(onDelete)
    );
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
        <div>
          Profit: <ValueIndicator value={asset.value.totalProfitLoss} />
        </div>
        <div>
          Period change: <PctIndicator value={asset.price.periodChangePct} />
        </div>
      </Card.Footer>
    </Card>
  );
};
