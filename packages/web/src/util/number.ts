import { ccyToLocale, type Ccy } from "@darkruby/assets-core";

export const moneyFormatter =
  (
    defaultCcy: Ccy,
    defaultLocale: Intl.LocalesArgument = ccyToLocale(defaultCcy)
  ) =>
  (
    number: number,
    currency: Ccy = defaultCcy,
    locale = defaultLocale
  ): string => {
    const div = currency == "GBp" ? 100 : 1;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(number / div);
  };

export const decimalFormatter =
  (locale: Intl.LocalesArgument, defaultPrec = 2) =>
  (value: number, prec = defaultPrec): string => {
    return Intl.NumberFormat(locale, {
      style: "decimal",
      maximumFractionDigits: prec,
    }).format(value);
  };

export const percentFormatter =
  (locale: Intl.LocalesArgument, defaultPrec = 2) =>
  (value: number, prec = defaultPrec): string => {
    return Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: prec,
    }).format(value);
  };
