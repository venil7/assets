import { format, formatISO } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd hh:mma";

export const iso = (d: Date) =>
  formatISO(d, { format: "extended", representation: "date" });

export const isoTimestamp = (d: Date) => format(d, DATE_FORMAT);
