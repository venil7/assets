import { type PostAsset, type Ticker } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { assetValidator } from "../../validation";
import { createForm, type FieldsProps } from "../Form/Form";
import { FormEdit } from "../Form/FormControl";
import { createModal } from "../Modals/Modal";
import { TickerLookup } from "../Tx/TickerLookup";

type AssetFieldsProps = FieldsProps<PostAsset>;

const AssetFields: React.FC<AssetFieldsProps> = ({
  data,
  onChange,
  disabled
}) => {
  const setField = usePartialChange(data, onChange);

  const handeSelect = ({ shortname, longname, symbol: ticker }: Ticker) =>
    onChange({ ticker, name: longname ?? shortname ?? ticker });

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Asset lookup</Form.Label>
        <TickerLookup onSelect={handeSelect} disabled={disabled} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <FormEdit
          value={data.name}
          onChange={setField("name")}
          disabled={disabled}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Ticker (Symbol)</Form.Label>
        <FormEdit
          value={data.ticker}
          onChange={setField("ticker")}
          disabled={disabled}
        />
      </Form.Group>
    </Form>
  );
};

export const AssetForm = createForm<PostAsset>(AssetFields, assetValidator);
export const AssetModal = createModal<PostAsset>(
  AssetFields,
  assetValidator,
  "Asset"
);
export const assetModal = (value: PostAsset) =>
  pipe(
    { value },
    createDialog<PostAsset, PropsOf<typeof AssetModal>>(AssetModal)
  );
