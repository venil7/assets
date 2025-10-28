import { defaultPrefs } from "@darkruby/assets-core";
import { decimal, money, percent } from "../util/number";
import { useStore } from "./store";

export const usePrefs = () => {
  const { prefs } = useStore();
  return prefs.data.value ?? defaultPrefs();
};

export const useFormatters = () => {
  const { base_ccy } = usePrefs();
  const prefMoney = (n: number) => money(n, base_ccy);
  const prefDecimal = (n: number) => decimal(n);
  const prefPercent = (n: number) => percent(n);
  return {
    money: prefMoney,
    decimal: prefDecimal,
    percent: prefPercent,
  };
};
