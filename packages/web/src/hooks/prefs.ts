import { ccyToLocale, defaultPrefs } from "@darkruby/assets-core";
import { decimal, money, percent } from "../util/number";
import { useStore } from "./store";

export const usePrefs = () => {
  const { prefs } = useStore();
  return prefs.data.value ?? defaultPrefs();
};

export const useFormatters = () => {
  const { base_ccy } = usePrefs();
  const locale = ccyToLocale(base_ccy);
  const prefMoney = (n: number) => money(n, base_ccy, locale);
  const prefDecimal = (n: number, prec = 2) => decimal(n, prec, locale);
  const prefPercent = (n: number, prec = 2) => percent(n, prec, locale);
  return {
    money: prefMoney,
    decimal: prefDecimal,
    percent: prefPercent,
  };
};
