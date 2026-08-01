import {
  defined,
  getToBase,
  isBuy,
  txBuy,
  txValidator,
  type Ccy,
  type EnrichedAsset,
  type Identity,
  type Nullable,
  type PostTx,
  type TxType
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useRef, useState } from "react";
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
import { fxRate, quote } from "../../services/ticker";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { DatePicker } from "../Form/DatePicker";
import { createForm, type FieldsProps } from "../Form/Form";
import { TextArea } from "../Form/FormControl";
import { MoneyField } from "../Form/MoneyEdit";
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
  const firstRender = useRef(true);

  const setField = usePartialChange(tx, onChange);
  const setType = setField("type");
  const setPrice = setField("price") as (n: Nullable<number>) => void;
  const setQty = setField("quantity") as (n: Nullable<number>) => void;
  const setDate = (d: Nullable<Date>) => setField("date")(d ?? new Date());
  const { money } = useFormatters();
  const assetCcy = asset.meta.currency as Ccy;

  const [total, setTotal] = useState<Nullable<number>>(tx.price * tx.quantity);

  const buy = txBuy(tx);
  const valueLbl = buy ? "Total Cost" : "Value";

  const [rate, setRate] = useState(asset.base.fxRate);
  const toBase = getToBase(rate);

  const getRate = (date: Date) =>
    pipe(
      fxRate(asset.base_ccy, assetCcy, date),
      TE.map((fx) => fx.rate),
      TE.getOrElse(() => () => Promise.resolve<number>(asset.base.fxRate))
    )();

  const getQuote = (date: Date) =>
    pipe(
      quote(asset.ticker, date),
      TE.map(({ price }) => price),
      TE.getOrElse(
        () => () => Promise.resolve<number>(asset.meta.regularMarketPrice)
      )
    )();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    getRate(tx.date).then(setRate);
    getQuote(tx.date).then(handlePrice);
  }, [tx.date]);

  useEffect(() => {
    if (prepopulatePrice) {
      setPrice(asset.meta.regularMarketPrice);
    }
  }, [prepopulatePrice]);

  const handlePrice = (p: Nullable<number>) => {
    if (defined(p)) {
      setPrice(p);
      if (defined(tx.quantity)) {
        const newTotal = p * tx.quantity;
        setTotal(newTotal);
      }
    } else {
      setPrice(0);
    }
  };

  const handleQty = (qty: Nullable<number>) => {
    if (defined(qty)) {
      setQty(qty);
      if (defined(tx.price)) {
        const newSpend = tx.price * qty;
        setTotal(newSpend);
      }
    } else {
      setQty(0);
    }
  };

  const handleTotal = (total: Nullable<number>) => {
    setTotal(total);
    if (defined(total)) {
      if (tx.price > 0) {
        const quantity = total / tx.price;
        setQty(quantity);
      }
    }
  };

  const handleSellAll = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handleQty(asset.holdings);
    event.preventDefault();
    event.stopPropagation();
  };

  const capGain = defined(total)
    ? (tx.price - asset.avg_price) * tx.quantity
    : null;

  return (
    <Form>
      <Form.Group className="mb-3">
        <TxTypeSwitch value={tx.type} onChange={setType} disabled={disabled} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Row>
          <Col lg={6}>
            <Form.Label>Price (per unit)</Form.Label>
            <MoneyField
              currency={assetCcy}
              toBase={toBase}
              disableNegative
              value={tx.price}
              onChange={handlePrice}
              disabled={disabled}
            />
          </Col>
          <Col lg={6}>
            <Form.Label>Quantity</Form.Label>
            <InputGroup>
              <FormNumber
                disableNegative
                value={tx.quantity}
                onChange={handleQty}
                disabled={disabled}
              />
              <InputGroup.Text hidden={buy} className="px-1">
                <a href="" onClick={handleSellAll}>
                  All
                </a>
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="mb-3">
        <Row>
          <Col lg={6}>
            <Form.Label>{valueLbl}</Form.Label>
            <MoneyField
              value={total}
              toBase={toBase}
              disableNegative
              currency={assetCcy}
              onChange={handleTotal}
              disabled={disabled}
            />
          </Col>
          <Col lg={6} hidden={buy}>
            <Form.Label>Cap gain</Form.Label>
            <MoneyField
              value={capGain}
              toBase={toBase}
              currency={assetCcy}
              onChange={setTotal}
              disabled
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
              {money(1, asset.base_ccy)}≈{money(rate, assetCcy)}
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
  const buy = isBuy(value);
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
