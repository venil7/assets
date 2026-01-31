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
      TE.bind("txBaseRate", ({ meta, asset }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy, tx.date)
      ),
      TE.bind("mktBaseRate", ({ meta, asset }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy)
      ),
      TE.map(({ asset, meta, txBaseRate, mktBaseRate }) => {
        const toMktBase = getToBase(mktBaseRate);
        const averageUnitCost = asset.avg_price!;

        switch (tx.type) {
          case "buy": {
            const toBuyBase = getToBase(txBaseRate);
            const costCcy = tx.price * tx.quantity;
            const valueCcy = meta.regularMarketPrice * tx.quantity;
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

            const fxImpact = (txBaseRate - mktBaseRate) * valueCcy;

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
                fxImpact,
                rate: txBaseRate
              }
            };
          }
          case "sell": {
            const costCcy = averageUnitCost * tx.quantity;
            const valueCcy = tx.price * tx.quantity;

            const [returnCcy, returnPctCcy] = change({
              before: costCcy,
              after: valueCcy
            });

            // before is wrong, but no better data available
            const costBase = toMktBase(averageUnitCost) * tx.quantity;
            const valueBase = toMktBase(meta.regularMarketPrice) * tx.quantity;

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
                fxImpact: null,
                rate: txBaseRate
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
