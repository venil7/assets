import { contramap, reverse, type Ord } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import { Ord as ordNumber } from "fp-ts/lib/number";
import * as t from "io-ts";
import type {
  EnrichedPortfolioDecoder,
  GetPortfolioDecoder,
  PortfolioMetaDecoder,
  PostPortfolioDecoder,
} from "../decoders/portfolio";

export type PostPortfolio = t.TypeOf<typeof PostPortfolioDecoder>;
export type GetPortfolio = t.TypeOf<typeof GetPortfolioDecoder>;

export type PortfolioMeta = t.TypeOf<typeof PortfolioMetaDecoder>;

export type EnrichedPortfolio = t.TypeOf<typeof EnrichedPortfolioDecoder>;

export const defaultPortfolio = (): PostPortfolio => ({
  name: "",
  description: "",
});

export const byPortfolioChangePct: Ord<EnrichedPortfolio> = pipe(
  ordNumber,
  reverse,
  contramap<number, EnrichedPortfolio>((p) => p.value.changePct)
);

export type PortfolioId = GetPortfolio["id"];
