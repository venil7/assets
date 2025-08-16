import {
  type Action,
  type GetAsset,
  type Optional,
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
    portfolioId: number,
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
    id: number,
    portfolioId: number,
    userId: UserId
  ): Action<Optional<GetAsset>> => {
    return pipe(
      queryOne({ id, portfolioId, userId }),
      ID.ap(sql.asset.get),
      ID.ap(db),
      TE.chain(liftTE(nullableDecoder(GetAssetDecoder)))
    );
  };

export const createAsset =
  (db: Database) =>
  (body: PostAsset, portfolioId: number): Action<ExecutionResult> =>
    pipe(
      execute<unknown[]>({ ...body, portfolioId }),
      ID.ap(sql.asset.insert),
      ID.ap(db)
    );

export const updateAsset =
  (db: Database) =>
  (
    assetId: number,
    body: PostAsset,
    portfolioId: number
  ): Action<ExecutionResult> =>
    pipe(
      execute<unknown[]>({ ...body, assetId, portfolioId }),
      ID.ap(sql.asset.update),
      ID.ap(db)
    );

export const deleteAsset =
  (db: Database) =>
  (id: number, portfolioId: number, userId: UserId): Action<ExecutionResult> =>
    pipe(
      execute<unknown>({ id, portfolioId, userId }),
      ID.ap(sql.asset.delete),
      ID.ap(db)
    );
