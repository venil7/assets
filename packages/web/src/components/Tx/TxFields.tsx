import {
  defined,
  getToBase,
  txValidator,
  type Ccy,
  type EnrichedAsset,
  type Identity,
  type Nullable,
  type PostTx,
  type TxType,
  type UnixDate
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useState } from "react";
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
import { fxRate } from "../../services/ticker";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { DatePicker } from "../Form/DatePicker";
import { createForm, type FieldsProps } from "../Form/Form";
import { TextArea } from "../Form/FormControl";
import { FormNumber } from "../Form/NumberEdit";
import { createModal } from "../Modals/Modal";

export type TxFieldsProps = Identity<
  FieldsProps<PostTx> & {
    asset: EnrichedAsset;
    prepopulatePrice?: boolean;
  }
>;

export const TxFields: React.FC<TxFieldsProps> = ({
  data: tx,
  asset,
  onChange,
  prepopulatePrice = false,
  disabled
}) => {
  const setField = usePartialChange(tx, onChange);
  const setPrice = setField("price") as (n: Nullable<number>) => void;
  const setQty = setField("quantity") as (n: Nullable<number>) => void;
  const setDate = (d: Nullable<Date>) => setField("date")(d ?? new Date());
  const { money } = useFormatters();

  const [spend, setSpend] = useState<Nullable<number>>(tx.price * tx.quantity);

  const [rate, setRate] = useState(asset.base.fxRate);
  const toBase = getToBase(rate);

  const getRate = (base: Ccy, ccy: string, date: Date | UnixDate) =>
    pipe(
      fxRate(base, ccy, date),
      TE.map((fx) => fx.rate),
      TE.getOrElse(() => () => Promise.resolve<number>(asset.base.fxRate))
    )();

  useEffect(() => {
    if (prepopulatePrice) {
      setPrice(asset.meta.regularMarketPrice);
    }
  }, [prepopulatePrice]);

  useEffect(() => {
    getRate(asset.base_ccy, asset.meta.currency, tx.date).then(setRate);
  }, [tx.date]);

  const handlePrice = (price: Nullable<number>) => {
    if (defined(price)) {
      if (defined(spend)) {
        onChange({ ...tx, quantity: spend / price, price });
      } else if (defined(tx.quantity)) {
        setPrice(price);
        setSpend(tx.quantity / price);
      }
    }
  };

  const handleQty = (qty: Nullable<number>) => {
    if (defined(qty)) {
      setSpend(tx.price * qty);
      setQty(qty);
    }
  };

  const handleSpend = (total: Nullable<number>) => {
    if (defined(total) && tx.price > 0) {
      setQty(total / tx.price);
      setSpend(total);
      return;
    }
    setQty(0);
  };

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
        <Form.Label>Price (per unit)</Form.Label>
        <Row>
          <Col>
            <InputGroup>
              <InputGroup.Text>{asset.meta.currency}</InputGroup.Text>
              <FormNumber
                value={tx.price}
                onChange={handlePrice}
                disabled={disabled}
              />
              <InputGroup.Text>{money(toBase(tx.price))}</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="mb-3">
        <Row>
          <Col>
            <Form.Label>Quantity</Form.Label>
            <FormNumber
              value={tx.quantity}
              onChange={handleQty}
              disabled={disabled}
            />
          </Col>
          <Col>
            <Form.Label>Cost / Value</Form.Label>
            <FormNumber
              value={spend}
              onChange={handleSpend}
              disabled={disabled}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Transaction date</Form.Label>
        <Row>
          <Col>
            <DatePicker date={tx.date} onChange={setDate} disabled={disabled} />
          </Col>
          <Col hidden={asset.base.domestic}>
            <InputGroup.Text>
              {money(1, asset.base_ccy)}≈
              {money(rate, asset.meta.currency as Ccy)}
            </InputGroup.Text>
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

export const txModal = (
  value: PostTx,
  props: Pick<TxFieldsProps, "asset" | "disabled" | "prepopulatePrice">
) =>
  pipe(
    { value, ...props },
    createDialog<PostTx, PropsOf<typeof TxModal>>(TxModal)
  );
