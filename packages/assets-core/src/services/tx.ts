import { type LazyArg, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { EnrichedAsset, EnrichedTx, GetTx } from "../domain";
import { changeInValue, changeInValuePct } from "../utils/finance";
import type { Action } from "../utils/utils";

export const getTxEnricher =
  (getEnrichedAsset: LazyArg<Action<EnrichedAsset>>) =>
  (tx: GetTx): Action<EnrichedTx> => {
    return pipe(
      TE.Do,
      TE.bind("asset", getEnrichedAsset),
      TE.map(({ asset }) => {
        const toBase = (n: number) => n / asset.value.baseRate;

        const changeCcy = pipe(
          asset.meta.regularMarketPrice,
          changeInValue(tx.price)
        );
        const changePct = pipe(
          asset.meta.regularMarketPrice,
          changeInValuePct(tx.price)
        );
        return {
          ...tx,
          changeCcy,
          changePct,
          changeBase: toBase(changeCcy),
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
