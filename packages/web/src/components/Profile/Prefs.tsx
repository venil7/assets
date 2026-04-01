import {
  BASE_CCYS,
  type Ccy,
  type Prefs as PrefsData
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { Eq as stringEq } from "fp-ts/lib/string";
import * as React from "react";
import { Form } from "react-bootstrap";
import { withFetching } from "../../decorators/fetching";
import { withProps } from "../../decorators/props";
import { usePartialState } from "../../hooks/formData";
import { PrimaryButton } from "../Form/FormControl";
import { Select } from "../Form/Select";
import { AdditionalFieldsPrefs } from "./AdditionalPrefs";

export const CcySelect = pipe(
  Select<Ccy>,
  withProps({ options: BASE_CCYS, onIdentify: stringEq.equals })
);

type PrefsProps = {
  prefs: PrefsData;
  onUpdate: (p: PrefsData) => void;
  disabled?: boolean;
};

const RawPrefs: React.FC<PrefsProps> = ({ prefs, onUpdate, disabled }) => {
  const [prf, setField] = usePartialState<PrefsData>(prefs);
  const handleSubmit = () => onUpdate(prf);
  const handleBaseCcy = setField("base_ccy");
  const handleAdditional = setField("additional");
  return (
    <>
      <Form>
        <Form.Group className="mb-3" controlId="formGroup1">
          <Form.Label>
            <strong>Base currency</strong>
          </Form.Label>
          <CcySelect
            value={prf.base_ccy}
            onSelect={handleBaseCcy}
            disabled={disabled}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formGroup1">
          <Form.Label>
            <strong>Additional</strong>
          </Form.Label>
          <AdditionalFieldsPrefs
            disabled={disabled}
            data={prf.additional}
            onChange={handleAdditional}
          />
        </Form.Group>

        <PrimaryButton onClick={handleSubmit} disabled={disabled}>
          Save
        </PrimaryButton>
      </Form>
    </>
  );
};

export const Prefs = pipe(RawPrefs, withFetching);
