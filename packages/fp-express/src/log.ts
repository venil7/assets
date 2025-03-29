import { formatISO } from "date-fns";

export const createLogger = (name: string) => {
  const date = new Date();
  const print = (s: string) => `[${formatISO(date)}] {${name}}: ${s}`;
  return {
    debug: (s: string) => console.debug(print(s)),
    info: (s: string) => console.info(print(s)),
    error: (s: string) => console.error(print(s)),
  };
};
