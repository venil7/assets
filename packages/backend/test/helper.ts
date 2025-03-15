import {
  api,
  type Api,
  type PostAsset,
  type PostPortfolio,
  type PostTransaction,
  type TransactionType,
} from "@darkruby/assets-core";
import faker from "faker";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

const BASE_URL = `http://${process.env.URL ?? "localhost:4020"}`;

const TEST_USERNAME = "admin";
const TEST_PASSWORD = "admin";

export const fakePortfolio = (): PostPortfolio => ({
  name: faker.lorem.slug(2),
  description: faker.lorem.slug(2),
});

export const fakeAsset = (
  ticker: string = faker.random.arrayElement(["msft", "mcd", "aapl"])
): PostAsset => ({
  ticker,
  name: faker.lorem.slug(2),
});

export const fakeTx = (
  type: TransactionType,
  quantity = faker.datatype.number(100),
  price = faker.datatype.number(100)
): PostTransaction => ({
  type,
  quantity,
  price,
  date: faker.date.past(),
});

export const fakeBuy = (
  quantity = faker.datatype.number(100),
  price = faker.datatype.number(100)
) => fakeTx("buy", quantity, price);
export const fakeSell = (
  quantity = faker.datatype.number(100),
  price = faker.datatype.number(100)
) => fakeTx("sell", quantity, price);

const createPortfolioAsset =
  (api: Api) =>
  (
    asset: PostAsset = fakeAsset(),
    portfolio: PostPortfolio = fakePortfolio()
  ) =>
    pipe(
      TE.Do,
      TE.bind("portfolio", () => api.createPortfolio(portfolio)),
      TE.bind("asset", ({ portfolio }) => api.createAsset(portfolio.id!, asset))
    );

const createPortfolioAssetTx =
  (api: Api) =>
  (
    tx: PostTransaction,
    asset: PostAsset = fakeAsset(),
    portfolio = fakePortfolio()
  ) =>
    pipe(
      createPortfolioAsset(api)(asset, portfolio),
      TE.bind("tx", ({ asset }) => api.createTx(asset.id!, tx))
    );

const createPortfolioAssetTxs =
  (api: Api) =>
  (txs: PostTransaction[], portfolio = fakePortfolio(), asset = fakeAsset()) =>
    pipe(
      createPortfolioAsset(api)(asset, portfolio),
      TE.bind("txs", ({ asset }) =>
        pipe(
          txs,
          TE.traverseArray((tx) => api.createTx(asset.id!, tx))
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
  pipe(api(BASE_URL)(TEST_USERNAME, TEST_PASSWORD), TE.map(getExtendedApi));
