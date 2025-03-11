import "dotenv/config";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { api, type Api, type Transaction } from "../client/api";
import type { TES } from "../client/rest";

export const run = async <A>(test: TES<A>) => {
  const result = await test();
  if (E.isLeft(result)) {
    throw new Error(result.left);
  }
  return result.right;
};

const TEST_USERNAME = "admin";
const TEST_PASSWORD = "admin";

const createPortfolioAsset =
  (api: Api) =>
  (
    portfolioName?: string,
    portfolioDescription?: string,
    assetName?: string,
    assetTicker?: string
  ) =>
    pipe(
      TE.Do,
      TE.bind("portfolio", () =>
        api.createPortfolio(portfolioName, portfolioDescription)
      ),
      TE.bind("asset", ({ portfolio }) =>
        api.createAsset(portfolio.id!, assetName, assetTicker)
      )
    );

const createPortfolioAssetTx =
  (api: Api) =>
  (
    tx: Transaction,
    portfolioName?: string,
    portfolioDescription?: string,
    assetName?: string,
    assetTicker?: string
  ) =>
    pipe(
      createPortfolioAsset(api)(
        portfolioName,
        portfolioDescription,
        assetName,
        assetTicker
      ),
      TE.bind("tx", ({ asset }) =>
        api.createTx(asset.id!, tx.type, tx.quantity, tx.price, tx.date)
      )
    );

const createPortfolioAssetTxs =
  (api: Api) =>
  (
    txs: Transaction[],
    portfolioName?: string,
    portfolioDescription?: string,
    assetName?: string,
    assetTicker?: string
  ) =>
    pipe(
      createPortfolioAsset(api)(
        portfolioName,
        portfolioDescription,
        assetName,
        assetTicker
      ),
      TE.bind("txs", ({ asset }) =>
        pipe(
          txs,
          TE.traverseArray(({ type, quantity, price, date }) =>
            api.createTx(asset.id!, type, quantity, price, date)
          )
        )
      )
    );

export const getExtendedApi = (api: Api) => {
  return {
    ...api,
    createPortfolioAsset: createPortfolioAsset(api),
    createPortfolioAssetTx: createPortfolioAssetTx(api),
    createPortfolioAssetTxs: createPortfolioAssetTxs(api),
  };
};

export type TestApi = ReturnType<typeof getExtendedApi>;

export const testApi = () =>
  pipe(api(TEST_USERNAME, TEST_PASSWORD), TE.map(getExtendedApi));
