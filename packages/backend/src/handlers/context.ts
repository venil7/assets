import type { Repository } from "../repository";
import type { AppCache } from "../services/cache";

export type Context = { repo: Repository; cache: AppCache };
