import type { Nullable } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { useEffect, useMemo, useState } from "react";
import type { FormControlProps } from "react-bootstrap";
import { withVisibility } from "../../decorators/nodata";
import { FormEdit } from "./FormControl";

export const numberToString = (
  value: Nullable<number>,
  dp: Nullable<number> = null,
  fallback = "-"
): string =>
  value !== null && !isNaN(value)
    ? dp !== null
      ? value.toFixed(dp)
      : value.toString()
    : fallback;

export type NumberInputProps = Omit<FormControlProps, "value" | "onChange"> & {
  value?: Nullable<number>;
  onChange: (n: number) => void;
  decimalPoints?: Nullable<number>;
  disableNegative?: boolean;
  disableFractional?: boolean;
};

const getInputNumberRegex = (
  disableNegative?: boolean,
  disableFractional?: boolean
) =>
  new RegExp(
    `^${disableNegative ? "" : "-?"}(\\d*${
      disableFractional ? "" : "(\\.\\d*)?"
    }|\\.\\d*)$`
  );

export const RawNumberInput = ({
  value = null,
  onBlur,
  onChange,
  decimalPoints,
  disableNegative,
  disableFractional,
  ...props
}: NumberInputProps) => {
  const [valueString, setValueString] = useState(() =>
    numberToString(value, decimalPoints, "")
  );

  useEffect(() => {
    if (value !== parseFloat(valueString)) {
      setValueString(numberToString(value, decimalPoints, ""));
    }
  }, [value]);

  const regex = useMemo(
    () => getInputNumberRegex(disableNegative, disableFractional),
    [disableNegative, disableFractional]
  );

  // const handleBlur = (newValue: string) => {
  //   const parsedValue = parseFloat(newValue);
  //   setValueString(numberToString(parsedValue, decimalPoints, ""));
  //   onBlur?.(isNaN(parsedValue) ? "" : parsedValue);
  // };

  const handleChange = (newValue: string) => {
    if (!regex.test(newValue)) return;
    const newValuePayload = newValue === "." ? "0." : newValue;
    const parsedValue = parseFloat(newValuePayload);
    setValueString(newValuePayload);
    if (!isNaN(parsedValue)) {
      onChange?.(parsedValue);
    }
  };

  return (
    <FormEdit
      {...props}
      value={valueString}
      // onBlur={handleBlur}
      onChange={handleChange}
    />
  );
};

export const FormNumber = pipe(RawNumberInput, withVisibility());
