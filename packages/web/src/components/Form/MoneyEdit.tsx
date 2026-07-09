import { maybe, type Ccy } from "@darkruby/assets-core";
import { InputGroup } from "react-bootstrap";
import { useFormatters, usePrefs } from "../../hooks/prefs";
import type { PropsOf } from "../../util/props";
import { FormNumber } from "./NumberEdit";

type MoneyFieldProps = PropsOf<typeof FormNumber> & {
  currency: Ccy;
  toBase: (n: number) => number;
};

export const MoneyField: React.FC<MoneyFieldProps> = ({
  currency,
  toBase,
  ...props
}) => {
  const { money } = useFormatters();
  const { base_ccy } = usePrefs();
  const sameCcy = currency == base_ccy;

  const toBaseMaybe = maybe(toBase);

  return (
    <InputGroup>
      <InputGroup.Text>{currency}</InputGroup.Text>
      <FormNumber {...props} />
      <InputGroup.Text hidden={sameCcy}>
        {money(toBaseMaybe(props.value))}
      </InputGroup.Text>
    </InputGroup>
  );
};
