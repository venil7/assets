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

        const buy = tx.type === "buy";
        const cost = tx.price * tx.quantity;
        const valueCcy = asset.meta.regularMarketPrice * tx.quantity;
        const valueBase = toBase(valueCcy);

        const averageUnitCost = asset.avg_price ?? asset.value.ccy.current;

        // if buy, calculates unrealized return
        const unrealizedReturnCcy = changeInValue({
          before: cost,
          after: valueCcy,
        });
        // if sell calculates realized return
        const realizedReturnCcy = (() => {
          const before = averageUnitCost * tx.quantity;
          return changeInValue({ before, after: cost });
        })();

        const returnCcy = buy ? unrealizedReturnCcy : realizedReturnCcy;

        const unrealizedReturnPct = changeInPct({
          before: tx.price,
          after: asset.meta.regularMarketPrice,
        });

        const realizedReturnPct = changeInPct({
          before: averageUnitCost,
          after: tx.price,
        });

        const returnPct = buy ? unrealizedReturnPct : realizedReturnPct;
        const returnBase = toBase(returnCcy);

        return {
          ...tx,
          cost,
          valueCcy,
          valueBase,
          returnPct,
          returnCcy,
          returnBase,
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
