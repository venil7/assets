import type { Ccy } from "@darkruby/assets-core";

export const money = (
  number: number,
  currency: Ccy,
  locale: Intl.LocalesArgument
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(number);
};

export const decimal = (
  value: number,
  prec = 2,
  locale: Intl.LocalesArgument
): string => {
  return Intl.NumberFormat(locale, {
    style: "decimal",
    maximumFractionDigits: prec,
  }).format(value);
};

export const percent = (
  value: number,
  prec = 2,
  locale: Intl.LocalesArgument
): string => {
  return Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: prec,
  }).format(value);
};
