import type { Ticker } from "@darkruby/assets-core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import AsyncSelect from "react-select/async";
import { lookupTicker } from "../../services/ticker";
import "./TickerLookup.scss";

type SelectOption<T> = {
  label: string;
  value: T;
};

const toOptions = (ticker: Ticker): SelectOption<Ticker> => ({
  label: `(${ticker.symbol}) ${ticker.shortname} - ${ticker.quoteType} - ${ticker.exchange}`,
  value: ticker,
});

const lookup = (s: string) =>
  pipe(
    lookupTicker(s),
    TE.map((x) => A.map(toOptions)(x.quotes)),
    TE.getOrElse(() => () => Promise.resolve<SelectOption<Ticker>[]>([]))
  )();

export type TickerLookupProps = {
  onSelect: (t: Ticker) => void;
  disabled?: boolean;
};

export const TickerLookup: React.FC<TickerLookupProps> = ({
  onSelect,
  disabled,
}) => {
  return (
    <AsyncSelect
      cacheOptions
      loadOptions={lookup}
      isDisabled={disabled}
      classNamePrefix="ticker-lookup"
      className="ticker-lookup-container"
      onChange={(x) => onSelect(x?.value as Ticker)}
    />
  );
};
