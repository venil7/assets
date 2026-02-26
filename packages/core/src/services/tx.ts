import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { getToBase, type EnrichedTx, type GetTx } from "../domain";
import type { YahooApi } from "../http";
import { change } from "../utils/finance";
import type { Action } from "../utils/utils";

export const getTxEnricher =
  (yahooApi: YahooApi) =>
  (tx: GetTx): Action<EnrichedTx> => {
    return pipe(
      TE.Do,
      TE.bind("meta", () => yahooApi.meta(tx.asset_ticker)),
      TE.bind("txFxRate", ({ meta }) =>
        yahooApi.baseCcyConversionRate(meta.currency, tx.user_base_ccy, tx.date)
      ),
      TE.bind("mktFxRate", ({ meta }) =>
        yahooApi.baseCcyConversionRate(meta.currency, tx.user_base_ccy)
      ),
      TE.map(({ meta, txFxRate, mktFxRate }) => {
        const toMktBase = getToBase(mktFxRate.rate);

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
            const costCcy = -tx.cost_basis; // avg price x qty
            const valueCcy = -tx.cost; // price x qty

            const [returnCcy, returnPctCcy] = change({
              before: costCcy,
              after: valueCcy
            });

            const toSellBase = getToBase(txFxRate.rate);
            const costBase = toSellBase(costCcy);
            const valueBase = toSellBase(valueCcy);

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
  (txs: GetTx[]): Action<readonly EnrichedTx[]> => {
    const enrichTx = getTxEnricher(yahooApi);
    return pipe(txs, TE.traverseSeqArray(enrichTx));
    // return pipe(txs, TE.traverseArray(enrichTx));
  };
