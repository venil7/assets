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
import { ChartSchema, enrichChart } from "./chart";

const RateRecSchema = {
  timestamp: Int32,
  rate: Float64
};
const TxSchema = {
  id: Int32,
  pnl: Float64,
  cost: Float64,
  price: Float64,
  value: Float64,
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
    changes: periodChangesCcy(asset, finalStretchTxs, assetPeriodChanges)
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
    const changes = $periodChangesBase(
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

  const value = asset.holdings * toBase(assetPeriodChanges.endPrice);
  const [returnValue, returnPct] = change({
    before: investedBase,
    after: value
  });
  const changes = $periodChangesBase(
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
    .withColumns(
      col("quantity_ext")
        .multiplyBy(col("price"))
        .cumSum()
        .alias("running_cost")
    )
    .toRecords() as unknown as EnrichedTx[];
};

const periodChangesCcy = (
  asset: GetAsset,
  finalStretchTxs: EnrichedTx[],
  assetPeriodChages: PeriodChanges
): PeriodChanges => {
  const { startTs, endTs } = assetPeriodChages;

  let beforePeriodTx = pipe(
    finalStretchTxs,
    earliestTxBeforeTimestamp(startTs)
  );
  const periodTxs = pipe(finalStretchTxs, txsAfterTimestamp(startTs));

  // no active investment during the period,
  if (!beforePeriodTx && !periodTxs.length) {
    return assetPeriodChages;
  }

  const costSum = sum<EnrichedTx>((t) => t.cost);
  const pnlPctContribuSum = sum<EnrichedTx>((t) => {
    const capitalContribution = t.cost / asset.invested;
    return t.pnl_pct * capitalContribution;
  });

  const calcBeforePeriod = (beforePeriodTx: EnrichedTx): PeriodChanges => {
    const startPrice =
      beforePeriodTx.running_holding * assetPeriodChages.startPrice;
    const endPrice =
      beforePeriodTx.running_holding * assetPeriodChages.endPrice;
    let [returnValue, returnPct] = change({
      before: startPrice,
      after: endPrice
    });
    const capitalContribution = beforePeriodTx.running_cost / asset.invested;
    returnPct *= capitalContribution;

    return { startPrice, endPrice, returnPct, returnValue, startTs, endTs };
  };

  const calcDuringPeriod = (periodTxs: EnrichedTx[]): PeriodChanges => {
    const endPrice = asset.holdings * assetPeriodChages.endPrice;
    const returnValue = endPrice - costSum(periodTxs);
    const returnPct = pnlPctContribuSum(periodTxs);

    return { startPrice: 0, endPrice, returnPct, returnValue, startTs, endTs };
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

  const startPrice =
    beforePeriodTx.running_holding * assetPeriodChages.startPrice;
  const endPrice = asset.holdings * assetPeriodChages.endPrice;
  const periodCost = costSum(periodTxs);
  const returnValue = endPrice - periodCost - startPrice;
  const returnPct = returnValue / (endPrice + periodCost);

  return {
    startPrice,
    endPrice,
    returnPct,
    returnValue,
    startTs,
    endTs
  };
};

const $periodChangesBase = (
  asset: GetAsset,
  $finalStretchTxsWithRate: DataFrame,
  assetPeriodChages: PeriodChanges,
  fxRates: FxRates
): PeriodChanges => {
  const findRate = fuzzyItemSearch<FxRecord>((item) => item.timestamp);
  const baseStartPrice = pipe(
    fxRates.rates,
    findRate(assetPeriodChages.startTs),
    (r) => getToBase(r.rate),
    ap(assetPeriodChages.startPrice)
  );
  const baseEndPrice = pipe(
    fxRates.rates,
    findRate(assetPeriodChages.endTs),
    (r) => getToBase(r.rate),
    ap(assetPeriodChages.endPrice)
  );
  const [returnValue, returnPct] = change({
    before: baseStartPrice,
    after: baseEndPrice
  });
  const ccyPeriodChanges = {
    ...assetPeriodChages,
    returnPct,
    returnValue,
    startPrice: baseStartPrice,
    endPrice: baseEndPrice
  } satisfies PeriodChanges;

  const finalStretchTxs = $applyRates($finalStretchTxsWithRate);
  const investedBase = $investedBase($finalStretchTxsWithRate);

  return periodChangesCcy(
    { ...asset, invested: investedBase } satisfies GetAsset,
    finalStretchTxs,
    ccyPeriodChanges
  );
};

const $finalStretch = ($txs: DataFrame): DataFrame =>
  $txs.filter(col("final_stretch"));
