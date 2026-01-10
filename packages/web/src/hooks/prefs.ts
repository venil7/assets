import { ccyToLocale, defaultPrefs } from "@darkruby/assets-core";
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
  const money = moneyFormatter(base_ccy, locale);
  const decimal = decimalFormatter(locale);
  const percent = percentFormatter(locale);
  return { money, decimal, percent };
};
