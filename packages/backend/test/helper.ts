import {
  api,
  BASE_CCYS,
  login,
  type Api,
  type Credentials,
  type PostAsset,
  type PostPortfolio,
  type PostPreference,
  type PostTx,
  type TxType,
} from "@darkruby/assets-core";
import faker from "faker";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

const BASE_URL = `http://${process.env.URL ?? "localhost:4020"}`;

export const fakePreferences = (): PostPreference => ({
  base_ccy: faker.random.arrayElement(BASE_CCYS),
});

export const fakeCredentials = (): Credentials => ({
  username: faker.internet.email(),
  password: faker.internet.password(),
});

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
  type: TxType,
  quantity = faker.datatype.number(100),
  price = faker.datatype.number(100)
): PostTx => ({
  type,
  quantity,
  price,
  date: faker.date.past(),
  comments: "",
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
      TE.bind("portfolio", () => api.portfolio.create(portfolio)),
      TE.bind("asset", ({ portfolio }) =>
        api.asset.create(portfolio.id!, asset)
      )
    );

const createPortfolioAssetTx =
  (api: Api) =>
  (tx: PostTx, asset: PostAsset = fakeAsset(), portfolio = fakePortfolio()) =>
    pipe(
      createPortfolioAsset(api)(asset, portfolio),
      TE.bind("tx", ({ asset }) => api.tx.create(asset.id!, tx))
    );

const createPortfolioAssetTxs =
  (api: Api) =>
  (txs: PostTx[], portfolio = fakePortfolio(), asset = fakeAsset()) =>
    pipe(
      createPortfolioAsset(api)(asset, portfolio),
      TE.bind("txs", ({ asset }) =>
        pipe(
          txs,
          TE.traverseArray((tx) => api.tx.create(asset.id!, tx))
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

const defaultAdminCredentials: Credentials = {
  username: "admin",
  password: "admin",
};

export const defaultLogin = (creds = defaultAdminCredentials) =>
  login(BASE_URL)(creds);
export const defaultApi = (creds = defaultAdminCredentials) =>
  pipe(defaultLogin(creds), TE.map(api(BASE_URL)), TE.map(getExtendedApi));

export const nonAdminApi = () =>
  pipe(
    TE.Do,
    TE.bind("adminApi", () => defaultApi()),
    TE.bind("credentials", () => TE.of(fakeCredentials())),
    TE.bind("user", ({ adminApi, credentials }) =>
      adminApi.user.create(credentials)
    ),
    TE.chain(({ credentials }) => defaultApi(credentials))
  );

export type TestApi = ReturnType<typeof getExtendedApi>;
