import { pipe, type LazyArg } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import {
  getToBase,
  type EnrichedTx,
  type GetAsset,
  type GetTx
} from "../domain";
import type { YahooApi } from "../http";
import { change } from "../utils/finance";
import type { Action } from "../utils/utils";

export const getTxEnricher =
  (yahooApi: YahooApi) =>
  (getAsset: LazyArg<Action<GetAsset>>) =>
  (tx: GetTx): Action<EnrichedTx> => {
    return pipe(
      TE.Do,
      TE.bind("asset", getAsset),
      TE.bind("meta", ({ asset }) => yahooApi.meta(asset.ticker)),
      TE.bind("txFxRate", ({ meta, asset }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy, tx.date)
      ),
      TE.bind("mktFxRate", ({ meta, asset }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy)
      ),
      TE.map(({ asset, meta, txFxRate, mktFxRate }) => {
        const toMktBase = getToBase(mktFxRate.rate);
        const averageUnitCost = asset.avg_price!;

        switch (tx.type) {
          case "buy": {
            const toBuyBase = getToBase(txFxRate.rate);
            const costCcy = tx.price * tx.quantity_ext;
            const valueCcy = meta.regularMarketPrice * tx.quantity_ext;
            const [returnCcy, returnPctCcy] = change({
              before: costCcy,
              after: valueCcy
            });
            const costBase = toBuyBase(costCcy);
            const valueBase = toMktBase(valueCcy);

            const [returnBase, returnPctBase] = change({
              before: costBase,
              after: valueBase
            });

            const fxImpact = (txFxRate.rate - mktFxRate.rate) * valueCcy;

            return {
              ...tx,
              ccy: {
                cost: costCcy,
                value: valueCcy,
                returnValue: returnCcy,
                returnPct: returnPctCcy
              },
              base: {
                cost: costBase,
                value: valueBase,
                returnValue: returnBase,
                returnPct: returnPctBase,
                fxRate: txFxRate.rate,
                fxImpact
              }
            };
          }
          case "sell": {
            const costCcy = averageUnitCost * tx.quantity_ext;
            const valueCcy = tx.price * tx.quantity_ext;

            const [returnCcy, returnPctCcy] = change({
              before: costCcy,
              after: valueCcy
            });

            // before is wrong, but no better data available
            const costBase = toMktBase(averageUnitCost) * tx.quantity_ext;
            const valueBase =
              toMktBase(meta.regularMarketPrice) * tx.quantity_ext;

            const [returnBase, returnPctBase] = change({
              before: costBase,
              after: valueBase
            });

            return {
              ...tx,
              ccy: {
                cost: costCcy,
                value: valueCcy,
                returnValue: returnCcy,
                returnPct: returnPctCcy
              },
              base: {
                cost: costBase,
                value: valueBase,
                returnValue: returnBase,
                returnPct: returnPctBase,
                fxRate: txFxRate.rate,
                fxImpact: null
              }
            };
          }
        }
      })
    );
  };

export const getTxsEnricher =
  (yahooApi: YahooApi) =>
  (getAsset: LazyArg<Action<GetAsset>>) =>
  (txs: GetTx[]): Action<readonly EnrichedTx[]> => {
    const txEnricher = getTxEnricher(yahooApi);
    return pipe(
      TE.Do,
      TE.bind("asset", getAsset),
      TE.chain(({ asset }) => {
        const enrichTx = pipe(() => TE.of(asset), txEnricher);
        return pipe(txs, TE.traverseArray(enrichTx));
      })
    );
  };
