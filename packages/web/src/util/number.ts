export const money = (number: number, currency = "GBP"): string => {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    number
  );
};

export const float = (number: number, prec = 2): string => number.toFixed(prec);
export const percent = (number: number, prec = 2): string =>
  `${float(number * 100, prec)}%`;
