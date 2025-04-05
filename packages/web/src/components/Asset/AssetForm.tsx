import { type PostAsset, type Ticker } from "@darkruby/assets-core";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { FormEdit } from "../Form/FormControl";
import { TickerLookup } from "../Tx/TickerLookup";

export type AssetFormProps = {
  asset: PostAsset;
  onChange: (p: PostAsset) => void;
};

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onChange }) => {
  const setField = usePartialChange(asset, onChange);

  const handeSelect = ({ shortname: name, symbol: ticker }: Ticker) =>
    onChange({ ticker, name: name ?? ticker });

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Lookup</Form.Label>
        <TickerLookup onSelect={handeSelect} />
      </Form.Group>
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
