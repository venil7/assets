import { formatISO } from "date-fns";

export const iso = (d: Date) =>
  formatISO(d, { format: "extended", representation: "date" });
