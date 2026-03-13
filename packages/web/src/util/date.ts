import { format, formatISO } from "date-fns";

export const DATE_FORMAT = "dd MMM yyyy";
export const DATE_TIME_FORMAT = `${DATE_FORMAT} hh:mma`;

export const iso = (d: Date) =>
  formatISO(d, { format: "extended", representation: "date" });

export const dateTimeFmt = (d: Date) => format(d, DATE_TIME_FORMAT);
export const dateFmt = (d: Date) => format(d, DATE_FORMAT);
