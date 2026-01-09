import { type LazyArg, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { EnrichedAsset, EnrichedTx, GetTx } from "../domain";
import { changeInPct, changeInValue } from "../utils/finance";
import type { Action } from "../utils/utils";

export const getTxEnricher =
  (getEnrichedAsset: LazyArg<Action<EnrichedAsset>>) =>
  (tx: GetTx): Action<EnrichedTx> => {
    return pipe(
      TE.Do,
      TE.bind("asset", getEnrichedAsset),
      TE.map(({ asset }) => {
        const toBase = (n: number) => n / asset.value.baseRate;
        const spent = tx.price * tx.quantity;

        const buy = tx.type === "buy";
        // if buy, calculates unrealized return
        const unrealizedReturnCcy = pipe(
          asset.meta.regularMarketPrice * tx.quantity, // after
          changeInValue(spent) // before
        );
        // if sell calculates realized return
        const realizedReturnCcy = (() => {
          const averagePrice = asset.avg_price ?? asset.value.ccy.current;
          const before = averagePrice * tx.quantity;
          const after = spent;
          return pipe(after, changeInValue(before));
        })();

        const returnCcy = buy ? unrealizedReturnCcy : realizedReturnCcy;

        const unrealizedReturnPct = pipe(
          asset.meta.regularMarketPrice, // after
          changeInPct(tx.price) // before
        );

        const realizedReturnPct = pipe(
          tx.price, // after
          changeInPct(asset.avg_price ?? asset.value.ccy.current) // before
        );

        const returnPct = buy ? unrealizedReturnPct : realizedReturnPct;

        return {
          ...tx,
          spent,
          returnPct,
          returnCcy,
          returnBase: toBase(returnCcy),
        };
      })
    );
  };

export const getTxsEnricher =
  (getEnrichedAsset: LazyArg<Action<EnrichedAsset>>) =>
  (txs: GetTx[]): Action<readonly EnrichedTx[]> => {
    return pipe(
      TE.Do,
      TE.bind("asset", getEnrichedAsset),
      TE.chain(({ asset }) => {
        const txEnricher = getTxEnricher(() => TE.of(asset));
        return pipe(txs, TE.traverseArray(txEnricher));
      })
    );
  };
