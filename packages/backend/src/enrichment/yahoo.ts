import {
  change,
  defaultTotals,
  earliestTxBeforeTimestamp,
  fuzzyItemSearch,
  getToBase,
  sum,
  txsAfterTimestamp,
  type ChartData,
  type EnrichedAssetBase,
  type EnrichedAssetCcy,
  type EnrichedTx,
  type FxRates,
  type FxRecord,
  type GetAsset,
  type Optional,
  type PeriodChanges,
  type YahooChartData
} from "@darkruby/assets-core";
import { ap } from "fp-ts/lib/Identity";
import { pipe } from "fp-ts/lib/function";
import { Eq as stringEq } from "fp-ts/lib/string";
import { col, Float64, Int32, lit, readRecords } from "nodejs-polars";
import { enrichChart } from "./chart";

const ChartSchema = {
  timestamp: Int32,
  price: Float64,
  volume: Float64
};
const RateRecSchema = {
  timestamp: Int32,
  rate: Float64
};
const TxSchema = {
  id: Int32,
  quantity_ext: Float64,
  price: Float64,
  value: Float64,
  timestamp: Int32
};

export const periodChanges = (
  asset: GetAsset,
  beforePeriodTx: Optional<EnrichedTx>,
  periodTxs: EnrichedTx[],
  assetPeriodChages: PeriodChanges,
  fxRates: Optional<FxRates> = null
): PeriodChanges => {
  const {
    start,
    end,
    current: currentPrice,
    beginning: periodStartPrice
  } = assetPeriodChages;

  // no active investment during the period,
  if (!beforePeriodTx && !periodTxs.length) {
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

  const costSum = sum<EnrichedTx>((t) => t.cost);
  const pnlPctContribuSum = sum<EnrichedTx>((t) => {
    const capitalContribution = t.cost / asset.invested;
    return t.pnl_pct * capitalContribution;
  });

  const calcBeforePeriod = (beforePeriodTx: EnrichedTx): PeriodChanges => {
    const beginning = beforePeriodTx.running_holding * periodStartPrice;
    const current = beforePeriodTx.running_holding * currentPrice;
    let [returnValue, returnPct] = change({
      before: beginning,
      after: current
    });
    const capitalContribution = beforePeriodTx.cost / asset.invested;
    returnPct *= capitalContribution;
    return { beginning, current, returnPct, returnValue, start, end };
  };

  const calcDuringPeriod = (periodTxs: EnrichedTx[]): PeriodChanges => {
    const current = asset.holdings * currentPrice;
    const returnValue = current - costSum(periodTxs);
    const returnPct = pnlPctContribuSum(periodTxs);

    return { beginning: 0, current, returnPct, returnValue, start, end };
  };

  // txs only inside period
  if (!beforePeriodTx && periodTxs.length) {
    return calcDuringPeriod(periodTxs);
  }

  // txs only outside period
  if (beforePeriodTx && !periodTxs.length) {
    return calcBeforePeriod(beforePeriodTx);
  }

  // txs both before and during period txs
  beforePeriodTx = beforePeriodTx!;
  const {
    beginning,
    returnPct: beforeReturnPct,
    returnValue: beforeReturnValue
  } = calcBeforePeriod(beforePeriodTx);
  const {
    current,
    returnPct: duringReturnPct,
    returnValue: duringReturnValue
  } = calcDuringPeriod(periodTxs);

  return {
    beginning,
    current,
    returnPct: beforeReturnPct + duringReturnPct,
    returnValue:
      beforeReturnValue + duringReturnValue - beforePeriodTx.running_cost,
    start,
    end
  };
};

export const enrichedAssetCcy = (
  asset: GetAsset,
  chart: YahooChartData,
  finalStretchTxs: EnrichedTx[]
): EnrichedAssetCcy => {
  const { chart: origChart, periodChanges: assetPeriodChanges, meta } = chart;
  const activeInvestemntStretch = !!finalStretchTxs.length;

  if (!activeInvestemntStretch) {
    const ccy = {
      chart: origChart,
      changes: assetPeriodChanges,
      totals: defaultTotals()
    } satisfies EnrichedAssetCcy;
    return ccy;
  }

  const beforePeriodStartTx = pipe(
    finalStretchTxs,
    earliestTxBeforeTimestamp(assetPeriodChanges.start)
  );
  const duringPeriodTxs = pipe(
    finalStretchTxs,
    txsAfterTimestamp(assetPeriodChanges.start)
  );

  const value = asset.holdings * meta.regularMarketPrice;
  const [returnValue, returnPct] = change({
    before: asset.invested,
    after: value
  });

  return {
    totals: { returnValue, returnPct },
    chart: enrichChart(origChart, finalStretchTxs),
    changes: periodChanges(
      asset,
      beforePeriodStartTx,
      duringPeriodTxs,
      assetPeriodChanges
    )
  };
};

export const enrichedAssetBase = (
  asset: GetAsset,
  chart: YahooChartData,
  finalStretchTxs: EnrichedTx[],
  ccy: EnrichedAssetCcy,
  fxRates: FxRates
): EnrichedAssetBase => {
  const { chart: origChart, periodChanges: assetPeriodChanges, meta } = chart;
  const domestic = stringEq.equals(meta.currency, asset.base_ccy);
  const activeInvestemntStretch = !!finalStretchTxs.length;

  if (!activeInvestemntStretch) {
    const base = {
      fxRate: domestic ? 1 : fxRates.latest.rate,
      domestic,
      invested: 0,
      fxImpact: 0,
      breakEven: 0,
      avgPrice: null,
      realizedPnl: 0, // < --- this is mising
      totals: defaultTotals(),
      chart: chartInBaseCcy(origChart, fxRates),
      changes: periodChanges(asset, null, [], assetPeriodChanges, fxRates)
    } satisfies EnrichedAssetBase;
    return base;
  }

  const domesticBase = {
    ...ccy,
    fxRate: 1,
    fxImpact: 0,
    domestic: true,
    invested: asset.invested,
    avgPrice: asset.avg_price,
    breakEven: asset.break_even,
    realizedPnl: asset.realized_pnl
  } satisfies EnrichedAssetBase;
  if (domestic) return domesticBase;

  const beforePeriodStartTx = pipe(
    finalStretchTxs,
    earliestTxBeforeTimestamp(assetPeriodChanges.start)
  );
  const duringPeriodTxs = pipe(
    finalStretchTxs,
    txsAfterTimestamp(assetPeriodChanges.start)
  );

  return {
    ...domesticBase,
    fxRate: fxRates.latest.rate,
    fxImpact: fxImpact(finalStretchTxs, fxRates),
    chart: chartInBaseCcy(origChart, fxRates)
  };
};

export const chartInBaseCcy = (
  chart: ChartData,
  fxRates: FxRates
): ChartData => {
  const C = readRecords(chart, { schema: ChartSchema });
  const R = readRecords(fxRates.rates, { schema: RateRecSchema });
  return C.joinAsof(R, { on: "timestamp", strategy: "nearest" }) //? nearest is questionable
    .select(
      col("timestamp"),
      col("volume"),
      col("price").divideBy(col("rate")).alias("price")
    )
    .toRecords() as ChartData;
};

export const fxImpact = (txs: EnrichedTx[], fxRates: FxRates): number => {
  const T = readRecords(txs, { schema: TxSchema });
  const R = readRecords(fxRates.rates, { schema: RateRecSchema });
  const TR = T.joinAsof(R, { on: "timestamp", strategy: "nearest" })
    .withColumns(lit(fxRates.latest.rate).alias("latest_rate"))
    .withColumns(
      col("value").divideBy(col("rate")).alias("value_base"),
      col("value").divideBy(col("latest_rate")).alias("todays_value_base")
    )
    .withColumns(
      col("todays_value_base").sub(col("value_base")).alias("fx_impact")
    );
  const { fxImpact } = TR.select(
    col("fx_impact").sum().alias("fxImpact")
  ).toRecords()[0];

  return Number(fxImpact);
};
