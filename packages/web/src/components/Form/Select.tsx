import type { Nullable } from "@darkruby/assets-core";
import { type Eq, fromEquals } from "fp-ts/lib/Eq";
import { useCallback } from "react";
import Form from "react-bootstrap/Form";

export type SelectProps<T> = {
  eq?: Eq<T>;
  options: readonly T[];
  disabled?: boolean;
  value?: Nullable<T>;
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
  eq = fromEquals<T>((a, b) => a === b),
  value,
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
      value={value ? toValue(value) : undefined}
      onSelect={handleSelect}
      onChange={handleSelect}
    >
      {options.map((opt) => (
        <option key={JSON.stringify(opt)} value={toValue(opt)}>
          {toLabel(opt)}
        </option>
      ))}
    </Form.Select>
  );
}
