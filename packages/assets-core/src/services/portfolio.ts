import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type {
  EnrichedAsset,
  EnrichedPortfolio,
  GetPortfolio,
  PeriodValue,
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
      /*const portfolioPrice: PeriodPrice = (() => {
        const periodStartPrice = pipe(
          assets,
          sum((a) => a.price.periodStartPrice * a.portfolio_contribution)
        );
        const periodEndPrice = pipe(
          assets,
          sum((a) => a.price.periodEndPrice * a.portfolio_contribution)
        );

        const periodChangePct =
          changeInValuePct(periodStartPrice)(periodEndPrice);
        const periodChange = changeInValue(periodStartPrice)(periodEndPrice);

        const lastUpdated = pipe(
          assets,
          A.map((a) => a.price.lastUpdated ?? new Date(0)),
          max
        );

        return {
          periodStartPrice,
          periodEndPrice,
          periodChangePct,
          periodChange,
          lastUpdated,
        };
      })();*/

      const portfolioValue: PeriodValue = (() => {
        const periodStartValue = pipe(
          assets,
          sum((a) => a.value.periodStartValue)
        );
        const periodEndValue = pipe(
          assets,
          sum((a) => a.value.periodEndValue)
        );

        const periodChangePct =
          changeInValuePct(periodStartValue)(periodEndValue);
        const periodChange = changeInValue(periodStartValue)(periodEndValue);

        const totalProfitLoss = periodEndValue - portfolio.total_invested;

        return {
          totalProfitLoss,
          periodStartValue,
          periodEndValue,
          periodChangePct,
          periodChange,
        };
      })();

      return {
        ...portfolio,
        // price: portfolioPrice,
        value: portfolioValue,
      };
    })
  );
};
