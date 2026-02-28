import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { type EnrichedTx, type GetTx } from "../domain";
import type { YahooApi } from "../http";
import { change } from "../utils/finance";
import type { Action } from "../utils/utils";

export const getTxEnricher =
  (yahooApi: YahooApi) =>
  (tx: GetTx): Action<EnrichedTx> => {
    return pipe(
      TE.Do,
      TE.bind("meta", () =>
        tx.final_stretch ? yahooApi.meta(tx.asset_ticker) : TE.of(null)
      ),
      TE.map(({ meta }) => {
        // if meta is present, TX is of last stretch, and needs enrichment
        const buy = tx.type == "buy";
        if (meta && buy) {
          const value = tx.quantity_ext * meta.regularMarketPrice;
          const [pnl, pnlPct] = change({ before: tx.cost, after: value });
          return { ...tx, value, pnl, pnl_pct: pnlPct };
        }
        // consider using EnrichTx decoder
        const { pnl, value, pnl_pct, ...rest } = tx;
        return { ...rest, pnl: pnl!, pnl_pct: pnl_pct!, value: value! };
      })
    );
  };

export const getTxsEnricher =
  (yahooApi: YahooApi) =>
  (txs: GetTx[]): Action<readonly EnrichedTx[]> => {
    const enrichTx = getTxEnricher(yahooApi);
    return pipe(txs, TE.traverseSeqArray(enrichTx)); // <-- sequential to take advantage of yahoo cache
  };
