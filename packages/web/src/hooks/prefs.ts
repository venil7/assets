import { ccyToLocale, defaultPrefs } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { fallback } from "../util/func";
import {
  decimalFormatter,
  moneyFormatter,
  percentFormatter,
} from "../util/number";
import { useStore } from "./store";

export const usePrefs = () => {
  const { prefs } = useStore();
  return prefs.data.value ?? defaultPrefs();
};

export const useFormatters = () => {
  const { base_ccy } = usePrefs();
  const locale = ccyToLocale(base_ccy);
  const money = pipe(moneyFormatter(base_ccy, locale), fallback);
  const decimal = pipe(decimalFormatter(locale), fallback);
  const percent = pipe(percentFormatter(locale), fallback);
  return { money, decimal, percent };
};
