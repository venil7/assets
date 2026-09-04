import type { Ccy, EnrichedAsset, EnrichedTx } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { ListGroup } from "react-bootstrap";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { defaultValidator } from "../../validation";
import type { FieldsProps } from "../Form/Form";
import { Decimal, Money } from "../Formatting";
import { Percent } from "../Formatting/Percent";
import { HorizontalStack } from "../Layout/Stack";
import { createModal } from "../Modals/Modal";

type TxDetailsProps = FieldsProps<EnrichedTx> & {
  asset: EnrichedAsset;
};

export const TxDetails: React.FC<TxDetailsProps> = ({ data: tx, asset }) => {
  const ccy = asset.meta.currency as Ccy;
  const domestic = asset.base.domestic;
  return (
    <div className="asset-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Running asset holding</strong>
            <Decimal value={tx.running_holding} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running unit cost</strong>
            <Money value={tx.running_average_price} ccy={ccy} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running asset cost</strong>
            <Money value={tx.running_cost} ccy={ccy} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running break even</strong>
            <Money value={tx.running_break_even} ccy={ccy} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Running contribution</strong>
            <Percent value={tx.running_contribution} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Holding contribution</strong>
            <Percent value={tx.contribution} />
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
