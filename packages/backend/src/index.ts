import { run, type Action } from "@darkruby/assets-core";
import { createRequestHandler } from "@darkruby/fp-express";
import { Database } from "bun:sqlite";
import cors from "cors";
import { default as express } from "express";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { LRUCache } from "lru-cache";
import { Server } from "node:http";
import path from "node:path";
import { createHandlers } from "./handlers";
import type { Context } from "./handlers/context";
import { createRepository, type Repository } from "./repository";
import {
  createCache,
  type AppCache,
  type Stringifiable,
} from "./services/cache";
import { env, envDurationMsec, envNumber } from "./services/env";
import { initializeApp } from "./services/init";
import { cachedYahooApi } from "./services/yahoo";

type Config = {
  database: string;
  app: string;
  port: number;
  cacheSize: number;
  cacheTtl: number;
};

const config = (): Action<Config> =>
  pipe(
    TE.Do,
    TE.apS("database", env("ASSETS_DB")),
    TE.apS("app", env("ASSETS_APP")),
    TE.apS("port", envNumber("ASSETS_PORT")),
    TE.apS("cacheSize", envNumber("ASSETS_CACHE_SIZE", 1000)),
    TE.apS("cacheTtl", envDurationMsec("ASSETS_CACHE_TTL", "1m"))
  );

const repository = (c: Config): Action<Repository> =>
  pipe(
    TE.of(new Database(c.database, { strict: true })),
    TE.map(createRepository)
  );

const cache = ({ cacheSize, cacheTtl }: Config): Action<AppCache> =>
  pipe(
    TE.of(
      new LRUCache<Stringifiable, any>({
        max: cacheSize,
        ttl: cacheTtl,
      })
    ),
    TE.map(createCache)
  );

const server = ({ port, app }: Config, ctx: Context): Action<Server> => {
  const expressify = createRequestHandler(ctx);
  const handlers = createHandlers(expressify);

  return pipe(
    TE.of(express()),
    TE.tapIO((exp) => () => {
      exp.use(cors());
      exp.use(express.json());
    }),
    TE.tapIO((exp) => () => {
      // routes
      exp.get("/", (_, res) => res.redirect("/app"));
      exp.use("/app", express.static(path.join(process.cwd(), app)));
      exp.use("/app/*", (_, res) =>
        res.sendFile(path.join(process.cwd(), app, "index.html"))
      );

      exp.post("/login", handlers.auth.login);

      const api = express();
      api.use(handlers.middleware.authenticate);

      const auth = express();
      auth.get("/refresh_token", handlers.auth.refreshToken);
      api.use("/auth", auth);

      const summary = express();
      summary.get("/", handlers.summary.get);
      api.use("/summary", summary);

      const profile = express();
      profile.get("/", handlers.profile.get);
      profile.put("/", handlers.profile.update);
      api.use("/profile", profile);

      const prefs = express();
      prefs.get("/", handlers.prefs.get);
      prefs.put("/", handlers.prefs.update);
      api.use("/prefs", prefs);

      const user = express(); // also prefs
      user.post("/", handlers.user.create);
      user.get("/", handlers.user.getMany);
      user.get("/:id", handlers.user.get);
      user.put("/:id", handlers.user.update);
      user.delete("/:id", handlers.user.delete);
      api.use("/users", user);

      const portfolios = express();
      portfolios.post("/", handlers.portfolio.create);
      portfolios.get("/", handlers.portfolio.getMany);
      portfolios.get("/:id", handlers.portfolio.get);
      portfolios.delete("/:id", handlers.portfolio.delete);
      portfolios.put("/:id", handlers.portfolio.update);
      api.use("/portfolios", portfolios);

      const assets = express();
      assets.post("/:portfolio_id/assets", handlers.assets.create);
      assets.get("/:portfolio_id/assets", handlers.assets.getMany);
      assets.get("/:portfolio_id/assets/:id", handlers.assets.get);
      assets.delete("/:portfolio_id/assets/:id", handlers.assets.delete);
      assets.put("/:portfolio_id/assets/:id", handlers.assets.update);
      portfolios.use("/", assets);

      const transactions = express();
      transactions.post("/:asset_id/tx", handlers.tx.create);
      transactions.get("/:asset_id/tx", handlers.tx.getMany);
      transactions.get("/:asset_id/tx/:id", handlers.tx.get);
      transactions.delete("/:asset_id/tx/:id", handlers.tx.delete);
      transactions.put("/:asset_id/tx/:id", handlers.tx.update);
      api.use("/assets", transactions);

      const lookup = express();
      lookup.get("/ticker", handlers.yahoo.search);
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
        TE.Do,
        TE.bind("repo", () => repository(config)),
        TE.bind("cache", () => cache(config)),
        TE.bind("yahooApi", ({ cache }) => TE.of(cachedYahooApi(cache)))
      )
    ),
    TE.bind("init", ({ context }) => initializeApp(context.repo)),
    TE.bind("server", ({ config, context }) => server(config, context))
  );

await run(app());
