import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

const BASE_URL = `http://${import.meta.env.VITE_URL ?? "localhost:8080"}`;

export const getPortfolios = (): Action<Portfolio[]> =>
  pipe(
    api(BASE_URL),
    (login) => login("admin", "admin"),
    TE.chain((a) => a.getPortfolios())
  );
