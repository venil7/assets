import type { Repository } from "../repository";
import type { WebService } from "../services";
import type { AppCache } from "../services/cache";
import type { YahooApi } from "../yahoo/client";

export type Context = {
  repo: Repository;
  service: WebService;
  cache: AppCache;
  yahooApi: YahooApi;
};
