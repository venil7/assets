import { type PostAsset } from "@darkruby/assets-core";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { FormEdit } from "../Form/FormControl";

export type AssetFormProps = {
  asset: PostAsset;
  onChange: (p: PostAsset) => void;
};

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onChange }) => {
  const setField = usePartialChange(asset, onChange);

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <FormEdit value={asset.name} onChange={setField("name")} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>ticker</Form.Label>
        <FormEdit value={asset.ticker} onChange={setField("ticker")} />
      </Form.Group>
    </Form>
  );
};
