import {
  handleError,
  type Action,
  type AssetId,
  type GetAsset,
  type Optional,
  type PortfolioId,
  type PostAsset,
  type UserId,
} from "@darkruby/assets-core";
import {
  GetAssetDecoder,
  GetAssetsDecoder,
} from "@darkruby/assets-core/src/decoders/asset";
import {
  liftTE,
  nullableDecoder,
} from "@darkruby/assets-core/src/decoders/util";
import type Database from "bun:sqlite";
import { pipe } from "fp-ts/lib/function";
import * as ID from "fp-ts/lib/Identity";
import * as TE from "fp-ts/lib/TaskEither";
import { defaultPaging } from "../domain/paging";
import { execute, queryMany, queryOne, type ExecutionResult } from "./database";
import {
  deleteAssetSql,
  getAssetSql,
  getAssetsSql,
  insertAssetSql,
  updateAssetSql,
} from "./sql" with { type: "macro" };

const sql = {
  asset: {
    get: TE.of(getAssetSql()),
    getMany: TE.of(getAssetsSql()),
    insert: TE.of(insertAssetSql()),
    update: TE.of(updateAssetSql()),
    delete: TE.of(deleteAssetSql()),
  },
};

export const getAssets =
  (db: Database) =>
  (
    portfolioId: PortfolioId,
    userId: UserId,
    paging = defaultPaging()
  ): Action<GetAsset[]> =>
    pipe(
      queryMany<unknown[]>({ userId, portfolioId, ...paging }),
      ID.ap(sql.asset.getMany),
      ID.ap(db),
      TE.chain(liftTE(GetAssetsDecoder))
    );

export const getAsset =
  (db: Database) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ): Action<Optional<GetAsset>> => {
    return pipe(
      queryOne({ assetId, portfolioId, userId }),
      ID.ap(sql.asset.get),
      ID.ap(db),
      TE.chain(liftTE(nullableDecoder(GetAssetDecoder)))
    );
  };

export const createAsset =
  (db: Database) =>
  (
    body: PostAsset,
    portfolioId: PortfolioId,
    userId: UserId
  ): Action<GetAsset> =>
    pipe(
      execute<unknown[]>({ ...body, portfolioId }),
      ID.ap(sql.asset.insert),
      ID.ap(db),
      TE.chain(([assetId]) => getAsset(db)(assetId, portfolioId, userId)),
      TE.filterOrElse(
        (a): a is GetAsset => Boolean(a),
        handleError("Failed to create asset")
      )
    );

export const updateAsset =
  (db: Database) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId,
    body: PostAsset
  ): Action<GetAsset> =>
    pipe(
      execute<unknown[]>({ ...body, assetId, portfolioId }),
      ID.ap(sql.asset.update),
      ID.ap(db),
      TE.chain(() => getAsset(db)(assetId, portfolioId, userId)),
      TE.filterOrElse(
        (a): a is GetAsset => Boolean(a),
        handleError("Failed to update asset")
      )
    );

export const deleteAsset =
  (db: Database) =>
  (
    assetId: AssetId,
    portfolioId: PortfolioId,
    userId: UserId
  ): Action<ExecutionResult> =>
    pipe(
      execute<unknown>({ assetId, portfolioId, userId }),
      ID.ap(sql.asset.delete),
      ID.ap(db)
    );
