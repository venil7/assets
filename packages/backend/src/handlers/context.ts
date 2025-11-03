import type { YahooApi } from "@darkruby/assets-core";
import type { Repository } from "../repository";
import type { WebService } from "../services";
import type { AppCache } from "../services/cache";

export type Context = {
  repo: Repository;
  service: WebService;
  cache: AppCache;
  yahooApi: YahooApi;
};
