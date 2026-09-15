import { contramap as contramapEq } from "fp-ts/lib/Eq";
import { contramap, reverse, type Ord } from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import { Eq as numberEq, Ord as numberOrd } from "fp-ts/lib/number";
import { Eq as stringEq } from "fp-ts/lib/string";
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
  contramap<number, EnrichedPortfolio>((p) => p.changes.returnPct)
);

export type PortfolioId = GetPortfolio["id"];

export const getPortfolioEq = pipe(
  numberEq,
  contramapEq((p: GetPortfolio) => p.id)
);

export const postPortfolioEq = pipe(
  stringEq,
  contramapEq((p: PostPortfolio) => p.name)
);
