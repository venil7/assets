import type { Nullable } from "@darkruby/assets-core";
import { useCallback } from "react";
import Form from "react-bootstrap/Form";

export type SelectProps<T> = {
  options: readonly T[];
  disabled?: boolean;
  value?: Nullable<T>;
  toValue?: (t: T) => string;
  toLabel?: (t: T) => string;
  onSelect: (option: T) => void;
  onIdentify: (value: string, candidate: T) => boolean;
};

export function Select<T>({
  options,
  onSelect,
  disabled = false,
  toValue = String,
  toLabel = String,
  onIdentify,
  value
}: SelectProps<T>): ReturnType<React.FC<SelectProps<T>>> {
  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      for (const opt of options) {
        if (onIdentify(e.currentTarget.value, opt)) {
          onSelect(opt);
          break;
        }
      }
    },
    [onSelect, onIdentify, options]
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
