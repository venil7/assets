import {
  type EnrichedAsset,
  type Nullable,
  type PostTx,
  type TxType,
} from "@darkruby/assets-core";
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { money } from "../../util/number";
import { TextArea } from "../Form/FormControl";
import { FormNumber } from "../Form/NumberEdit";

export type TxFormProps = {
  tx: PostTx;
  asset: EnrichedAsset;
  onChange: (p: PostTx) => void;
};

export const TxForm: React.FC<TxFormProps> = ({ tx, asset, onChange }) => {
  const setField = usePartialChange(tx, onChange);
  const setPrice = setField("price") as (n: Nullable<number>) => void;
  const setQuantity = setField("quantity") as (n: Nullable<number>) => void;

  const basePrice = money(tx.price / asset.value.baseRate);

  return (
    <Form>
      <Form.Group className="mb-3">
        <TxTypeSwitch value={tx.type} onChange={setField("type")} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Quantity</Form.Label>
        <FormNumber value={tx.quantity} onChange={setQuantity} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Price (per unit)</Form.Label>
        <Row>
          <Col>
            <InputGroup>
              <InputGroup.Text>{asset.meta.currency}</InputGroup.Text>
              <FormNumber value={tx.price} onChange={setPrice} />
              <InputGroup.Text>{basePrice}</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Comment</Form.Label>
        <TextArea value={tx.comments} onChange={setField("comments")} />
      </Form.Group>
    </Form>
  );
};

export const TxTypeSwitch: React.FC<{
  onChange: (tx: TxType) => void;
  value: TxType;
}> = ({ onChange, value }) => {
  const buy = value === "buy";
  const sell = !buy;
  return (
    <ButtonGroup>
      <Button
        onClick={() => onChange("buy")}
        variant={buy ? "primary" : "secondary"}
        active={buy}
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
