import {
  defaultBuyTx,
  type EnrichedAsset,
  type PostAsset,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Card, Stack } from "react-bootstrap";
import { Link } from "react-router";
import { PctChangeIndicator, WeightIndicator } from "../Badge/Badges";
import { confirmationModal } from "../Modals/Confirmation";
import { routes } from "../Router";
import { Totals } from "../Totals/Totals";
import { txModal } from "../Tx/TxModal";
import "./Asset.scss";
import { assetModal } from "./AssetModal";
import { AssetMenu } from "./Menu";

export type AssetLinkProps = {
  asset: EnrichedAsset;
  onAddTx: (t: PostTx) => void;
  onUpdate: (a: PostAsset) => void;
  onDelete: () => void;
};

export const AssetLink = ({
  asset,
  onUpdate,
  onDelete,
  onAddTx,
}: AssetLinkProps) => {
  const handleUpdate = pipe(() => assetModal(asset), TE.map(onUpdate));
  const handleDelete = pipe(
    () => confirmationModal(`Delete '${asset.name}'?`),
    TE.map(onDelete)
  );
  const handleAddTx = pipe(() => txModal(defaultBuyTx()), TE.map(onAddTx));

  return (
    <Card className="asset-link">
      <Card.Body>
        <Link to={routes.asset(asset.portfolio_id, asset.id)}>
          <Card.Title className="name">
            <Stack direction="horizontal">
              <div>{asset.name}</div>
              <div className="ms-auto">
                <Totals
                  value={asset.value.base.current}
                  totals={asset.totals.base}
                />
              </div>
            </Stack>
          </Card.Title>
          <Card.Subtitle className="description">{asset.ticker}</Card.Subtitle>
        </Link>
      </Card.Body>
      <Card.Footer className="spread-container">
        <div className="stick-left">
          <WeightIndicator value={asset.value.weight!} />
        </div>
        <div className="stick-right">
          <PctChangeIndicator value={asset.value.ccy.changePct} />
          <AssetMenu
            onDelete={handleDelete}
            onEdit={handleUpdate}
            onAddTx={handleAddTx}
          />
        </div>
      </Card.Footer>
    </Card>
  );
};
