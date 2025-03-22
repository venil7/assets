export const money = (number: number, currency = "GBP"): string => {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    number
  );
};
