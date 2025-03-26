import { pipe } from "fp-ts/lib/function";
import * as NeA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import type {
  ChartData,
  EnrichedAsset,
  GetAsset,
  PeriodValue,
} from "../domain";
import { yahooApi } from "../http";
import type { Action, Optional } from "../utils/utils";

export const enrichedAssets = (assets: GetAsset[]): Action<EnrichedAsset[]> =>
  pipe(assets, TE.traverseArray(enrichAsset)) as Action<EnrichedAsset[]>;

export const enrichOptionalAsset = (
  a: Optional<GetAsset>
): Action<Optional<EnrichedAsset>> => (a ? enrichAsset(a) : TE.of(null));

export const enrichAsset = (asset: GetAsset): Action<EnrichedAsset> => {
  return pipe(
    TE.Do,
    TE.apS("asset", TE.of(asset)),
    TE.bind("enrich", ({ asset }) => yahooApi.chart(asset.ticker)),
    TE.map(({ asset, enrich: { chart, price, meta } }) => {
      const assetChart: ChartData = pipe(
        chart,
        NeA.map((dp) => ({
          ...dp,
          // if no holdings, keep price per unit
          price: dp.price * (asset.holdings || 1),
        }))
      );

      const assetValue: PeriodValue = (() => {
        const periodStartValue = price.periodStartPrice * asset.holdings;
        const periodEndValue = price.periodEndPrice * asset.holdings;
        const profitLoss = pipe(
          O.fromNullable(asset.avg_price),
          O.map(() => periodEndValue - asset.invested),
          O.getOrElse(() => 0)
        );
        return {
          profitLoss,
          periodStartValue,
          periodEndValue,
        };
      })();

      return {
        ...asset,
        meta,
        price,
        chart: assetChart,
        value: assetValue,
      };
    })
  );
};
