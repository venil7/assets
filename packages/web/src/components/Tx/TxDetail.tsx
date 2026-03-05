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
            <strong>Running asset holding</strong>
            <span>{decimal(tx.running_holding)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running unit cost</strong>
            <span>{money(tx.running_average_price, ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running asset cost</strong>
            <span>{money(tx.running_cost, ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running break even</strong>
            <span>{money(tx.running_break_even, ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running contribution</strong>
            <span>{percent(tx.running_contribution)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Asset contribution</strong>
            <span>{percent(tx.contribution)}</span>
          </ListGroup.Item>
        </ListGroup>
        <ListGroup variant="flush" hidden={domestic}>
          <ListGroup.Item>
            <strong>Comments</strong>
            <pre>{tx.comments}</pre>
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
