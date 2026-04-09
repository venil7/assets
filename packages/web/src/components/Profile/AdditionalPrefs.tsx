import type { AdditionalPrefs as AdditionalPrefsData } from "@darkruby/assets-core";
import * as React from "react";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import type { FieldsProps } from "../Form/Form";
import { CheckBox } from "../Form/FormControl";

type AdditionalPrefsFieldsProps = FieldsProps<AdditionalPrefsData>;

export const AdditionalFieldsPrefs: React.FC<AdditionalPrefsFieldsProps> = ({
  data,
  onChange,
  disabled
}: AdditionalPrefsFieldsProps) => {
  const setField = usePartialChange(data, onChange);

  return (
    <>
      <Form.Group className="mb-3">
        <CheckBox
          inline
          checked={data.altChart}
          onChange={setField("altChart")}
          disabled={disabled}
        />
        <Form.Label>
          Layered chart <em>(Experimental)</em>
        </Form.Label>
      </Form.Group>
    </>
  );
};
