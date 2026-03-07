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
import {
  Bool,
  col,
  DataFrame,
  Float64,
  Int32,
  lit,
  readRecords
} from "nodejs-polars";
import { enrichChart } from "./chart";

export const ChartSchema = {
  timestamp: Int32,
  price: Float64,
  volume: Float64
};
export const RateRecSchema = {
  timestamp: Int32,
  rate: Float64
};
export const TxSchema = {
  id: Int32,
  pnl: Float64,
  cost: Float64,
  price: Float64,
  value: Float64,
  // date: Datetime(), //<--possibly remove
  pnl_pct: Float64,
  timestamp: Int32,
  final_stretch: Bool,
  quantity_ext: Float64,
  running_cost: Float64,
  running_holding: Float64
};

export const txsWithRates = (
  txs: EnrichedTx[],
  fxRates: FxRates
): DataFrame => {
  const $txs = readRecords(txs, { schema: TxSchema });
  const $fxRates = readRecords(fxRates.rates, { schema: RateRecSchema });
  return $txs
    .joinAsof($fxRates, { on: "timestamp", strategy: "nearest" })
    .withColumns(lit(fxRates.latest.rate).alias("latest_rate"));
};

export const $enrichedAssetCcy = (
  asset: GetAsset,
  chart: YahooChartData,
  $txsWithRate: DataFrame
): EnrichedAssetCcy => {
  const { chart: origChart, periodChanges: assetPeriodChanges, meta } = chart;
  const activeInvestemnt = asset.invested > 0;

  if (!activeInvestemnt) {
    return {
      chart: origChart,
      changes: assetPeriodChanges,
      totals: defaultTotals()
    } satisfies EnrichedAssetCcy;
  }
  const $finalStretchTxsWithRate = $finalStretch($txsWithRate);
  const value = asset.holdings * meta.regularMarketPrice;
  const [returnValue, returnPct] = change({
    before: asset.invested,
    after: value
  });
  const finalStretchTxs = $applyRates($finalStretchTxsWithRate);
  return {
    totals: { returnValue, returnPct },
    chart: enrichChart(origChart, finalStretchTxs),
    changes: $periodChanges(asset, $finalStretchTxsWithRate, assetPeriodChanges)
  };
};

export const $enrichedAssetBase = (
  asset: GetAsset,
  chart: YahooChartData,
  $txsWithRate: DataFrame,
  ccy: EnrichedAssetCcy,
  fxRates: FxRates
): EnrichedAssetBase => {
  const { chart: origChart, periodChanges: assetPeriodChanges, meta } = chart;
  const domestic = stringEq.equals(meta.currency, asset.base_ccy);

  const $finalStretchTxsWithRate = $finalStretch($txsWithRate);
  const activeInvestmentStretch =
    asset.holdings > 0 && $finalStretchTxsWithRate.shape.height > 0;
  const investedBase = $investedBase($finalStretchTxsWithRate);
  const fxRate = fxRates.latest.rate;

  if (!activeInvestmentStretch) {
    const changes = $periodChanges(
      asset,
      $finalStretchTxsWithRate,
      assetPeriodChanges,
      fxRates
    );
    const base = {
      fxRate,
      domestic,
      invested: 0,
      fxImpact: 0,
      breakEven: 0,
      avgPrice: null,
      changes,
      realizedPnl: $realizedPnl($txsWithRate),
      totals: defaultTotals(),
      chart: chartInBaseCcy(origChart, fxRates)
    } satisfies EnrichedAssetBase;
    return base;
  }

  const domesticBase = {
    ...ccy,
    fxRate,
    fxImpact: 0,
    domestic,
    invested: asset.invested,
    avgPrice: asset.avg_price,
    breakEven: asset.break_even,
    realizedPnl: asset.realized_pnl
  } satisfies EnrichedAssetBase;
  if (domestic) return domesticBase;

  const breakEven = $breakEven($finalStretchTxsWithRate);
  const avgPrice = breakEven / asset.holdings;
  const toBase = getToBase(fxRates.latest.rate);
  const value = asset.holdings * toBase(assetPeriodChanges.current);
  const [returnValue, returnPct] = change({
    before: investedBase,
    after: value
  });
  const changes = $periodChanges(
    asset,
    $finalStretchTxsWithRate,
    assetPeriodChanges,
    fxRates
  );

  return {
    avgPrice,
    breakEven,
    domestic: false,
    invested: investedBase,
    fxRate: fxRates.latest.rate,
    realizedPnl: $realizedPnl($txsWithRate),
    fxImpact: $fxImpact($finalStretchTxsWithRate),
    chart: chartInBaseCcy(ccy.chart, fxRates),
    changes,
    totals: { returnValue, returnPct }
  } satisfies EnrichedAssetBase;
};

const chartInBaseCcy = (chart: ChartData, fxRates: FxRates): ChartData => {
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

const $fxImpact = ($finalStretchTxsWithRate: DataFrame): number => {
  const $fxImpact = $finalStretchTxsWithRate
    .withColumns(
      col("cost").divideBy(col("rate")).alias("cost_base"),
      col("value").divideBy(col("rate")).alias("value_base"),
      col("value").divideBy(col("latest_rate")).alias("todays_value_base")
    )
    .withColumns(
      col("todays_value_base").sub(col("value_base")).alias("fx_impact")
    );
  const { fxImpact } = $fxImpact
    .select(col("fx_impact").sum().alias("fxImpact"))
    .toRecords()[0];

  return Number(fxImpact);
};

const $realizedPnl = ($txsWithRates: DataFrame): number => {
  const { realizedPnl } = $txsWithRates
    .filter(col("quantity_ext").lt(0))
    .withColumns(col("pnl").divideBy(col("rate")).alias("pnl_base"))
    .select(col("pnl_base").sum().alias("realizedPnl"))
    .toRecords()[0];

  return Number(realizedPnl);
};

const $investedBase = ($finalStretchTxsWithRate: DataFrame): number => {
  const { invested } = $finalStretchTxsWithRate
    .select(col("cost").divideBy(col("rate")).sum().alias("invested"))
    .toRecords()[0];

  return Number(invested);
};

const $breakEven = ($finalStretchTxsWithRate: DataFrame): number => {
  const { breakEven } = $finalStretchTxsWithRate
    .withColumns(col("cost").divideBy(col("rate")).alias("cost_base"))
    .select(col("cost_base").sum().alias("breakEven"))
    .toRecords()[0];

  return Number(breakEven);
};

const $applyRates = ($finalStretchTxsWithRate: DataFrame): EnrichedTx[] => {
  return $finalStretchTxsWithRate
    .withColumns(
      col("cost").divideBy(col("rate")).alias("cost"),
      col("value").divideBy(col("latest_rate")).alias("value")
    )
    .withColumns(col("value").minus(col("cost")).alias("pnl"))
    .withColumns(col("pnl").divideBy("cost").alias("pnl_pct"))
    .toRecords() as unknown as EnrichedTx[];
};

const $periodChanges = (
  asset: GetAsset,
  $finalStretchTxsWithRate: DataFrame,
  assetPeriodChages: PeriodChanges,
  fxRates: Optional<FxRates> = null
): PeriodChanges => {
  const {
    start,
    end,
    current: currentPrice,
    beginning: periodStartPrice
  } = assetPeriodChages;

  const finalStretchTxs = $applyRates($finalStretchTxsWithRate);
  const investedBase = $investedBase($finalStretchTxsWithRate);

  let beforePeriodTx = pipe(finalStretchTxs, earliestTxBeforeTimestamp(start));
  const periodTxs = pipe(finalStretchTxs, txsAfterTimestamp(start));

  // no active investment during the period,
  if (!beforePeriodTx && !periodTxs.length) {
    // if domestic
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
    const capitalContribution = t.cost / investedBase;
    return t.pnl_pct * capitalContribution;
  });

  const calcBeforePeriod = (beforePeriodTx: EnrichedTx): PeriodChanges => {
    const beginning = beforePeriodTx.running_holding * periodStartPrice;
    const current = beforePeriodTx.running_holding * currentPrice;
    let [returnValue, returnPct] = change({
      before: beginning,
      after: current
    });
    const capitalContribution = beforePeriodTx.cost / investedBase; //asset.invested;
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

  const returnPct = beforeReturnPct + duringReturnPct;
  const returnValue =
    beforeReturnValue + duringReturnValue - beforePeriodTx.running_cost;

  return {
    beginning,
    current,
    returnPct,
    returnValue,
    start,
    end
  };
};

const $finalStretch = ($txsWithRate: DataFrame): DataFrame =>
  $txsWithRate.filter(col("final_stretch"));
