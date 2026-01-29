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
      TE.bind("buyBaseRate", ({ meta, asset }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy, tx.date)
      ),
      TE.bind("mktBaseRate", ({ meta, asset }) =>
        yahooApi.baseCcyConversionRate(meta.currency, asset.base_ccy)
      ),
      TE.map(({ asset, meta, buyBaseRate, mktBaseRate }) => {
        const toBuyBase = getToBase(buyBaseRate);
        const toMktBase = getToBase(mktBaseRate);

        const buy = tx.type === "buy";
        const rate = buy ? buyBaseRate : mktBaseRate;
        const costCcy = tx.price * tx.quantity;
        const valueCcy = meta.regularMarketPrice * tx.quantity;
        const costBase = toBuyBase(costCcy);
        const valueBase = toMktBase(valueCcy);

        const averageUnitCost = asset.avg_price!;

        // if buy, calculates unrealized return
        const [unrealizedReturnCcy, unrealizedReturnPct] = change({
          before: costCcy,
          after: valueCcy
        });
        // if sell calculates realized return
        const [realizedReturnCcy, realizedReturnPct] = change({
          before: averageUnitCost * tx.quantity,
          after: costCcy //cost here is selling price*amount
        });

        const returnCcy = buy ? unrealizedReturnCcy : realizedReturnCcy;
        const returnPctCcy = buy ? unrealizedReturnPct : realizedReturnPct;

        const [unrealizedReturnBase, unrealizedReturnPctBase] = change({
          before: costBase,
          after: valueBase
        });

        const [realizedReturnBase, realizedReturnPctBase] = change({
          before: toMktBase(averageUnitCost) * tx.quantity, // this is wrong, but no better data available
          after: costBase
        });
        const returnBase = buy ? unrealizedReturnBase : realizedReturnBase;
        const returnPctBase = buy
          ? unrealizedReturnPctBase
          : realizedReturnPctBase;
        const fxImpact = (() => {
          const buyValue0 = toBuyBase(valueCcy);
          const returnBase0 = buyValue0 - costBase;
          return returnBase - returnBase0;
        })();

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
            rate
          }
        };
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
