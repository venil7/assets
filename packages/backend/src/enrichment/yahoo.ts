import {
  change,
  fuzzyItemSearch,
  getToBase,
  sum,
  type ChartData,
  type EnrichedTx,
  type FxRates,
  type FxRecord,
  type Optional,
  type PeriodChanges
} from "@darkruby/assets-core";
import { ap } from "fp-ts/lib/Identity";
import { pipe } from "fp-ts/lib/function";
import { col, Float64, Int32, readRecords } from "nodejs-polars";

export const periodChanges = (
  periodTxs: EnrichedTx[],
  assetPeriodChages: PeriodChanges,
  fxRates: Optional<FxRates> = null
): PeriodChanges => {
  const { start, end } = assetPeriodChages;

  if (!periodTxs.length) {
    if (!fxRates) return assetPeriodChages;

    const findRate = fuzzyItemSearch<FxRecord>((item) => item.timestamp);
    const beginning = pipe(
      fxRates.rates,
      findRate(assetPeriodChages.start),
      (r) => getToBase(r.rate),
      ap(assetPeriodChages.beginning)
    );
    const current = pipe(
      fxRates.rates,
      findRate(assetPeriodChages.start),
      (r) => getToBase(r.rate),
      ap(assetPeriodChages.current)
    );
    const [returnValue, returnPct] = change({
      before: beginning,
      after: current
    });
    return { beginning, current, returnPct, returnValue, start, end };
  }

  const [initTx, ...restTxs] = periodTxs;
  const lastTx = restTxs[restTxs.length - 1] ?? initTx;
  const { current: currentPrice, beginning: periodStartPrice } =
    assetPeriodChages;
  const value = lastTx.running_cost * currentPrice;
  const costSum = sum<EnrichedTx>((t) => t.cost);
  const initValue = initTx.running_holding * periodStartPrice;
  const returnValue = value - costSum(restTxs) - initValue;
  const pctContribuSum = sum<EnrichedTx>((t) => {
    // first TX goes by running holding, and running contrib
    if (t.id == initTx.id) {
      const periodStartValue = t.running_holding * assetPeriodChages.current;
      const [, periodReturnPct] = change({
        before: periodStartValue,
        after: t.value
      });
      return periodReturnPct * t.running_contribution;
    }
    // others go by quantity and contrib
    const periodStartValue = t.quantity_ext * assetPeriodChages.current;
    const [, periodReturnPct] = change({
      before: periodStartValue,
      after: t.value
    });
    return periodReturnPct * t.contribution;
  });
  const returnPct = pctContribuSum(periodTxs);

  return {
    beginning: initValue,
    current: value,
    returnPct,
    returnValue,
    start,
    end
  };
};

/*export const foreignAssetBaseCalc = (
  periodTxs: EnrichedTx[],
  assetPeriodChages: PeriodChanges,
  fxRates: FxRates
): EnrichedAssetBase => {
  const TXs = readRecords(periodTxs);
  const FXs = readRecords(fxRates.rates);
  const FX = DataFrame({ latest_fx: [fxRates.latest.rate] });
  const EnrichedTxs = TXs.joinAsof(FXs, { on: "timestamp" })
    .join(FX, { how: "cross" })
    .withColumn(col("price").divideBy(col("latest_fx")).alias("price_base"))
    .withColumns(
      col("price_base").multiplyBy(col("quantity_ext")).alias("cost_base"),
      col("price_base").multiplyBy(col("value")).alias("value_base"),
      col("price_base")
        .multiplyBy(col("todays_rate"))
        .alias("todays_value_base")
    )
    .withColumns(
      col("todays_value_base").sub(col("value_base")).alias("fx_impact")
    );

  //extract invested and fx impact from enriched txs
  const { invested, fxImpact } = EnrichedTxs.select(
    col("cost_base").sum().alias("invested"),
    col("fx_impact").sum().alias("fxImpact")
  ).toRecords()[0];

  return {
    invested,
    fxImpact
    //  chart: chartInBaseCcy(origChart, fxRates),
  };
};*/

export const chartInBaseCcy = (
  chart: ChartData,
  fxRates: FxRates
): ChartData => {
  const ChartSchema = {
    timestamp: Int32,
    price: Float64,
    volume: Float64
  };
  const RateRecSchema = {
    timestamp: Int32,
    rate: Float64
  };
  const C = readRecords(chart, { schema: ChartSchema });
  const R = readRecords(fxRates.rates, { schema: RateRecSchema });
  return C.joinAsof(R, { on: "timestamp", strategy: "nearest" })
    .select(
      col("timestamp"),
      col("volume"),
      col("price").divideBy(col("rate")).alias("price")
    )
    .toRecords() as ChartData;
};

// export const priceForDate = (
//   data: YahooChartData,
//   date: Optional<Date>
// ): number => {
//   // if no date supplied return Market price
//   if (!date) return data.meta.regularMarketPrice;
//   // else return best price approximation, by fuzzy searching in chart data
//   const fuzzyFindChartIndex = fuzzyIndexSearch<ChartDataItem>(
//     (item) => item.timestamp
//   );
//   const idx = pipe(data.chart, fuzzyFindChartIndex(getUnixTime(date)));
//   return data.chart[idx].price;
// };
