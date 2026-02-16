import { contramap as contramapEq } from "fp-ts/lib/Eq";
import { contramap, reverse, type Ord } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import { Eq as numberEq, Ord as numberOrd } from "fp-ts/lib/number";
import * as t from "io-ts";
import type {
  EnrichedPortfolioDecoder,
  GetPortfolioDecoder,
  PortfolioMetaDecoder,
  PostPortfolioDecoder
} from "../decoders/portfolio";

export type PostPortfolio = t.TypeOf<typeof PostPortfolioDecoder>;
export type GetPortfolio = t.TypeOf<typeof GetPortfolioDecoder>;

export type PortfolioMeta = t.TypeOf<typeof PortfolioMetaDecoder>;

export type EnrichedPortfolio = t.TypeOf<typeof EnrichedPortfolioDecoder>;

export const defaultPortfolio = (): PostPortfolio => ({
  name: "",
  description: ""
});

export const byPortfolioChangePct: Ord<EnrichedPortfolio> = pipe(
  numberOrd,
  reverse,
  contramap<number, EnrichedPortfolio>((p) => p.base.changes.returnPct)
);

export type PortfolioId = GetPortfolio["id"];

export const portfolioEq = pipe(
  numberEq,
  contramapEq((p: GetPortfolio) => p.id)
);
