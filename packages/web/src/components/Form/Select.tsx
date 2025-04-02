import type { Nullable } from "@darkruby/assets-core";
import { eq as eqmod } from "fp-ts";
import { type Eq } from "fp-ts/lib/Eq";
import { useCallback } from "react";
import Form from "react-bootstrap/Form";

export type SelectProps<T> = {
  eq?: Eq<T>;
  options: T[];
  disabled?: boolean;
  selected?: Nullable<T>;
  toValue?: (t: T) => string;
  toLabel?: (t: T) => string;
  onSelect: (option: T) => void;
};

export function Select<T>({
  options,
  onSelect,
  disabled = false,
  toValue = String,
  toLabel = String,
  eq = eqmod.fromEquals<T>((a, b) => a === b),
  selected,
}: SelectProps<T>): ReturnType<React.FC<SelectProps<T>>> {
  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const sel = options.find((opt) =>
        eq.equals(opt, e.currentTarget.value as T)
      );
      if (sel) {
        onSelect?.(sel);
      }
    },
    [onSelect, eq, options]
  );

  return (
    <Form.Select
      disabled={disabled}
      value={selected ? toValue(selected) : undefined}
      onSelect={handleSelect}
    >
      {options.map((opt) => (
        <option key={JSON.stringify(opt)} value={toValue(opt)}>
          {toLabel(opt)}
        </option>
      ))}
    </Form.Select>
  );
}
