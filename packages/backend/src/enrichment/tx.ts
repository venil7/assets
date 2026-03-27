import {
  calcPnl,
  isBuy,
  type Action,
  type EnrichedTx,
  type GetTx
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { type YahooApi } from "../yahoo/client";

const getTxEnricher =
  (yahooApi: YahooApi) =>
  (tx: GetTx): Action<EnrichedTx> => {
    return pipe(
      TE.Do,
      TE.bind("meta", () =>
        tx.final_stretch ? yahooApi.meta(tx.asset_ticker) : TE.of(null)
      ),
      TE.map(({ meta }) => {
        // if meta is present, TX is of last stretch, and needs enrichment
        const buy = isBuy(tx);
        if (meta && buy) {
          const value = tx.quantity_ext * meta.regularMarketPrice;
          const [pnl, pnlPct] = calcPnl({ before: tx.cost, after: value });
          return { ...tx, value, pnl, pnl_pct: pnlPct };
        }
        // todo: use EnrichTx decoder
        const { pnl, value, pnl_pct, ...rest } = tx;
        return { ...rest, pnl: pnl!, pnl_pct: pnl_pct!, value: value! };
      })
    );
  };

const getTxsEnricher =
  (yahooApi: YahooApi) =>
  (txs: GetTx[]): Action<EnrichedTx[]> => {
    const enrichTx = getTxEnricher(yahooApi);
    return pipe(txs, TE.traverseSeqArray(enrichTx)) as Action<EnrichedTx[]>; // <-- sequential to take advantage of yahoo cache
    // return pipe(txs, TE.traverseArray(enrichTx)) as Action<EnrichedTx[]>; // <-- sequential to take advantage of yahoo cache
  };

export type TxEnricher = ReturnType<typeof createTxEnricher>;

export const createTxEnricher = (yahooApi: YahooApi) => {
  return {
    enrich: getTxEnricher(yahooApi),
    enrichMany: getTxsEnricher(yahooApi)
  };
};
