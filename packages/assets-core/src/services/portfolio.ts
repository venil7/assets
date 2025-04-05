import { max } from "date-fns";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type {
  EnrichedAsset,
  EnrichedPortfolio,
  GetPortfolio,
  PeriodChanges,
  Totals,
} from "../domain";
import { changeInValue, changeInValuePct, sum } from "../utils/finance";
import type { Action, Optional } from "../utils/utils";

export const enrichedPortfolios = (
  portfolios: GetPortfolio[],
  f: (p: GetPortfolio) => Action<EnrichedAsset[]>
) =>
  pipe(
    portfolios,
    TE.traverseArray((p) => enrichPortfolio(p, () => f(p)))
  ) as Action<EnrichedPortfolio[]>;

export const enrichedOptionalPortfolio = (
  p: Optional<GetPortfolio>,
  getEnrichedAssets: () => Action<EnrichedAsset[]>
) => (p ? enrichPortfolio(p, getEnrichedAssets) : TE.of(null));

export const enrichPortfolio = (
  portfolio: GetPortfolio,
  getEnrichedAssets: () => Action<EnrichedAsset[]>
): Action<EnrichedPortfolio> => {
  return pipe(
    TE.Do,
    TE.apS("portfolio", TE.of(portfolio)),
    TE.bind("assets", getEnrichedAssets),
    TE.map(({ portfolio, assets }) => {
      const value: PeriodChanges = (() => {
        const beginning = pipe(
          assets,
          sum(({ value }) => value.base.beginning)
        );
        const current = pipe(
          assets,
          sum(({ value }) => value.base.current)
        );

        const change = changeInValue(beginning)(current);
        const changePct = changeInValuePct(beginning)(current);
        const date = assets.length
          ? pipe(
              assets,
              A.map(({ value }) => value.ccy.date),
              max
            )
          : new Date();

        return {
          beginning,
          current,
          change,
          changePct,
          date,
        };
      })();

      const totals = ((): Totals => {
        const profitLoss = pipe(
          assets,
          sum(({ totals }) => totals.base.profitLoss)
        );
        const profitLossPct = pipe(
          assets,
          sum(
            ({ totals, portfolio_contribution }) =>
              totals.base.profitLossPct * portfolio_contribution
          )
        );
        return { profitLoss, profitLossPct };
      })();

      return { ...portfolio, value, totals };
    })
  );
};
