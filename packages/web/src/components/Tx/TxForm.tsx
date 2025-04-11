import { type Nullable, type PostTx, type TxType } from "@darkruby/assets-core";
import { Button, ButtonGroup, Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { TextArea } from "../Form/FormControl";
import { FormNumber } from "../Form/NumberEdit";

export type TxFormProps = {
  tx: PostTx;
  onChange: (p: PostTx) => void;
};

export const TxForm: React.FC<TxFormProps> = ({ tx, onChange }) => {
  const setField = usePartialChange(tx, onChange);
  const setPrice = setField("price") as (n: Nullable<number>) => void;
  const setQuantity = setField("quantity") as (n: Nullable<number>) => void;

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
        <Form.Label>Price</Form.Label>
        <FormNumber value={tx.price} onChange={setPrice} />
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
  return (
    <ButtonGroup>
      <Button
        onClick={() => onChange("buy")}
        variant="secondary"
        active={value == "buy"}
      >
        Buy
      </Button>
      <Button
        onClick={() => onChange("sell")}
        variant="secondary"
        active={value == "sell"}
      >
        Sell
      </Button>
    </ButtonGroup>
  );
};
