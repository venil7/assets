import {
  BASE_CCYS,
  type Ccy,
  type Prefs as PrefsData,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Form } from "react-bootstrap";
import { withFetching } from "../../decorators/fetching";
import { withProps } from "../../decorators/props";
import { usePartialState } from "../../hooks/formData";
import { PrimaryButton } from "../Form/FormControl";
import { Select } from "../Form/Select";

const CcySelect = pipe(Select<Ccy>, withProps({ options: BASE_CCYS }));

type PrefsProps = {
  prefs: PrefsData;
  onUpdate: (p: PrefsData) => void;
};

const RawPrefs: React.FC<PrefsProps> = ({ prefs, onUpdate }) => {
  const [prf, setField] = usePartialState<PrefsData>(prefs);
  const handleSubmit = () => onUpdate(prf);
  const handleBaseCcy = setField("base_ccy");
  return (
    <>
      <Form>
        <Form.Group className="mb-3" controlId="formGroup1">
          <Form.Label>Base currency</Form.Label>
          <CcySelect value={prf.base_ccy} onSelect={handleBaseCcy} />
        </Form.Group>
        <PrimaryButton onClick={handleSubmit}>Submit</PrimaryButton>
      </Form>
    </>
  );
};

export const Prefs = pipe(RawPrefs, withFetching);
