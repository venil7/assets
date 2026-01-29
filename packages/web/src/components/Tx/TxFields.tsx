import {
  txValidator,
  type EnrichedAsset,
  type Identity,
  type Nullable,
  type PostTx,
  type TxType
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  InputGroup,
  Row
} from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { useFormatters } from "../../hooks/prefs";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { DatePicker } from "../Form/DatePicker";
import { createForm, type FieldsProps } from "../Form/Form";
import { TextArea } from "../Form/FormControl";
import { FormNumber } from "../Form/NumberEdit";
import { createModal } from "../Modals/Modal";

export type TxFieldsProps = Identity<
  FieldsProps<PostTx> & { asset: EnrichedAsset }
>;

export const TxFields: React.FC<TxFieldsProps> = ({
  data: tx,
  asset,
  onChange,
  disabled
}) => {
  const setField = usePartialChange(tx, onChange);
  const setPrice = setField("price") as (n: Nullable<number>) => void;
  const setDate = (d: Nullable<Date>) => setField("date")(d ?? new Date());
  const setQuantity = setField("quantity") as (n: Nullable<number>) => void;
  const { money } = useFormatters();

  const basePrice = money(tx.price / asset.mktBaseRate);

  return (
    <Form>
      <Form.Group className="mb-3">
        <TxTypeSwitch
          value={tx.type}
          onChange={setField("type")}
          disabled={disabled}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Quantity</Form.Label>
        <FormNumber
          value={tx.quantity}
          onChange={setQuantity}
          disabled={disabled}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Price (per unit)</Form.Label>
        <Row>
          <Col>
            <InputGroup>
              <InputGroup.Text>{asset.meta.currency}</InputGroup.Text>
              <FormNumber
                value={tx.price}
                onChange={setPrice}
                disabled={disabled}
              />
              <InputGroup.Text>{basePrice}</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Date</Form.Label>
        <Row>
          <Col>
            <DatePicker date={tx.date} onChange={setDate} disabled={disabled} />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Comment</Form.Label>
        <TextArea
          value={tx.comments}
          onChange={setField("comments")}
          disabled={disabled}
        />
      </Form.Group>
    </Form>
  );
};

export const TxTypeSwitch: React.FC<{
  onChange: (tx: TxType) => void;
  value: TxType;
  disabled?: boolean;
}> = ({ onChange, value, disabled }) => {
  const buy = value === "buy";
  const sell = !buy;
  return (
    <ButtonGroup>
      <Button
        onClick={() => onChange("buy")}
        variant={buy ? "primary" : "secondary"}
        active={buy}
        disabled={disabled}
      >
        Buy
      </Button>
      <Button
        onClick={() => onChange("sell")}
        variant={sell ? "primary" : "secondary"}
        active={sell}
      >
        Sell
      </Button>
    </ButtonGroup>
  );
};

export const TxForm = createForm<PostTx, TxFieldsProps>(TxFields, txValidator);
export const TxModal = createModal<PostTx, TxFieldsProps>(
  TxFields,
  txValidator,
  "Transaction"
);

export const txModal = (value: PostTx, asset: EnrichedAsset) =>
  pipe(
    { value, asset },
    createDialog<PostTx, PropsOf<typeof TxModal>>(TxModal)
  );
