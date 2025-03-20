import { run, type Action } from "@darkruby/assets-core";
import { createRequestHandler } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import cors from "cors";
import { default as express } from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Server } from "node:http";
import {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
} from "./handlers/asset";
import { login, refreshToken, verifyToken } from "./handlers/auth";
import {
  createPortfolio,
  deletePortfolio,
  getPortfolio,
  getPortfolios,
} from "./handlers/portfolio";
import { createTx, deleteTx, getTx, getTxs } from "./handlers/transaction";
import { yahooSearch } from "./handlers/yahoo";
import { env, envNumber } from "./services/env";

type Config = {
  database: string;
  port: number;
};

const config = (): Action<Config> =>
  pipe(
    TE.Do,
    TE.apS("database", env("ASSETS_DB")),
    TE.apS("port", envNumber("ASSETS_PORT"))
  );

const database = (c: Config): Action<Database> =>
  TE.of(new Database(c.database, { strict: true }));

type Context = { db: Database };

const server = ({ port }: Config, ctx: Context): Action<Server> => {
  const expressify = createRequestHandler(ctx);

  return pipe(
    TE.of(express()),
    TE.tapIO((exp) => () => {
      exp.use(cors());
      exp.use(express.json());
    }),
    TE.tapIO((exp) => () => {
      // routes
      exp.post("/login", pipe(login, expressify));

      const api = express();
      api.use(pipe(verifyToken, expressify));

      const auth = express();
      auth.get("/refresh_token", pipe(refreshToken, expressify));
      api.use("/auth", auth);

      const portfolios = express();
      portfolios.post("/", pipe(createPortfolio, expressify));
      portfolios.get("/", pipe(getPortfolios, expressify));
      portfolios.get("/:id", pipe(getPortfolio, expressify));
      portfolios.delete("/:id", pipe(deletePortfolio, expressify));
      api.use("/portfolios", portfolios);

      const assets = express();
      assets.post("/:portfolio_id/assets", pipe(createAsset, expressify));
      assets.get("/:portfolio_id/assets", pipe(getAssets, expressify));
      assets.get("/:portfolio_id/assets/:id", pipe(getAsset, expressify));
      assets.delete("/:portfolio_id/assets/:id", pipe(deleteAsset, expressify));
      portfolios.use("/", assets);

      const transactions = express();
      transactions.post("/:asset_id/transactions", pipe(createTx, expressify));
      transactions.get("/:asset_id/transactions", pipe(getTxs, expressify));
      transactions.get("/:asset_id/transactions/:id", pipe(getTx, expressify));
      transactions.delete(
        "/:asset_id/transactions/:id",
        pipe(deleteTx, expressify)
      );
      api.use("/assets", transactions);

      const lookup = express();
      lookup.get("/ticker", pipe(yahooSearch, expressify));

      api.use("/lookup", lookup);

      exp.use("/api/v1", api);
    }),
    TE.map((exp) => exp.listen(port, () => console.log(`Listening on ${port}`)))
  );
};

const app = () =>
  pipe(
    TE.Do,
    TE.bind("config", config),
    TE.bind("context", ({ config }) =>
      pipe(
        database(config),
        TE.map<Database, Context>((db) => ({ db }))
      )
    ),
    TE.bind("server", ({ config, context }) => server(config, context))
  );

await run(app());
