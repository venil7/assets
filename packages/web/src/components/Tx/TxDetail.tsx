import type { Ccy, EnrichedAsset, EnrichedTx } from "@darkruby/assets-core";
import { defaultValidator } from "@darkruby/assets-core/src/validation/util";
import { pipe } from "fp-ts/lib/function";
import { ListGroup } from "react-bootstrap";
import { useFormatters } from "../../hooks/prefs";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import type { FieldsProps } from "../Form/Form";
import { HorizontalStack } from "../Layout/Stack";
import { createModal } from "../Modals/Modal";

type TxDetailsProps = FieldsProps<EnrichedTx> & {
  asset: EnrichedAsset;
};

export const TxDetails: React.FC<TxDetailsProps> = ({ data: tx, asset }) => {
  const { decimal, money, percent } = useFormatters();
  const ccy = asset.meta.currency as Ccy;
  const domestic = asset.domestic;
  return (
    <div className="asset-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>
              Holdings <em>(post-transaction)</em>
            </strong>
            <span>{decimal(tx.holdings)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>
              Avg unit cost <em>(post-transaction)</em>
            </strong>
            <span>{money(tx.avg_price, ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>
              Asset cost <em>(post-transaction)</em>
            </strong>
            <span>{money(tx.total_invested, ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Asset contribution</strong>
            <span>{percent(tx.contribution)}</span>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush" hidden={domestic}>
          <ListGroup.Item>
            <strong>Fx rate</strong>
            <span>
              {money(1)}={money(tx.base.fxRate, ccy)}
            </span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Fx impact</strong>
            <span>{money(tx.base.fxImpact)}</span>
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};

export const TxDetailsModal = createModal<EnrichedTx, TxDetailsProps>(
  TxDetails,
  defaultValidator,
  "Transaction Details"
);

export const txDetailsModal = (
  value: EnrichedTx,
  { asset }: Pick<TxDetailsProps, "asset">
) =>
  pipe(
    { value, asset },
    createDialog<EnrichedTx, PropsOf<typeof TxDetailsModal>>(TxDetailsModal)
  );
