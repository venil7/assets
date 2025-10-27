import type { Ccy } from "@darkruby/assets-core";

export const money = (
  number: number,
  currency: Ccy,
  locale = "en-GB"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    // maximumFractionDigits: 2,
  }).format(number);
};

export const decimal = (value: number, prec = 2): string => {
  return Intl.NumberFormat("en-GB", {
    style: "decimal",
    maximumFractionDigits: prec,
  }).format(value);
};

export const percent = (value: number, prec = 2): string => {
  return Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: prec,
  }).format(value);
};
