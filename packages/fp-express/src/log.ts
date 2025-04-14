import { formatISO } from "date-fns";

export const createLogger = (name: string) => {
  const print = (s: string) => `[${formatISO(new Date())}] {${name}}: ${s}`;
  return {
    debug: (s: string) => console.debug(print(s)),
    info: (s: string) => console.info(print(s)),
    error: (s: string) => console.error(print(s)),
  };
};
