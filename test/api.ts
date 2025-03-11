import { formatISO } from "date-fns";
import "dotenv/config";
import faker from "faker";
import { BASE_URL, type Methods } from "./index";

const PORTFOLIO_URL = `${BASE_URL}/api/v1/portfolio`;
const AUTH_URL = `${BASE_URL}/api/v1/auth`;
const REFRESH_TOKEN_URL = `${AUTH_URL}/refresh_token`;
const TICKER_URL = `${BASE_URL}/api/v1/lookup/ticker`;
const TX_URL = (assetId: number) =>
  `${BASE_URL}/api/v1/portfolio/assets/${assetId}/transactions`;

export type Portfolio = {
  id?: number;
  user_id?: number;
  name: string;
  description: string;
  total_invested: number;
  num_assets: number;
  created?: string;
  modified?: string;
};

export type Asset = {
  id?: number;
  portfolio_id?: number;
  name: string;
  ticker: string;
  created?: string;
  modified?: string;
};

export type AssetHolding = Asset & {
  holdings: number;
  invested: number;
  avg_price: number;
  portfolio_contribution?: number | null;
};

type Ticker = {
  exchange: string;
  shortname: string;
  quoteType: string;
  symbol: string;
  longname: string;
};

export type Transaction = {
  id?: number;
  asset_id?: number;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  created?: string;
  modified?: string;
};

type TickerSearchResult = {
  quotes: Ticker[];
};

export const api = (methods: Methods) => {
  const getRefreshToken = () =>
    methods.get<{ token: string }>(REFRESH_TOKEN_URL);
  const createPortfolio = (name?: string, description?: string) =>
    methods.post<Portfolio>(PORTFOLIO_URL, {
      name: name ?? faker.lorem.slug(),
      description: description ?? faker.lorem.slug(),
    });

  const getPortfolio = (id: number) =>
    methods.get<Portfolio>(`${PORTFOLIO_URL}/${id}`);

  const deletePortfolio = (id: number) =>
    methods.delete<Portfolio>(`${PORTFOLIO_URL}/${id}`);

  const getPortfolios = () => methods.get<Portfolio>(PORTFOLIO_URL);

  const createAsset = (portfolioId: number, name?: string, ticker?: string) =>
    methods.post<AssetHolding>(`${PORTFOLIO_URL}/${portfolioId}/assets`, {
      name: name ?? faker.lorem.slug(2),
      ticker: ticker ?? faker.lorem.slug(1),
    });

  const getAsset = (portfolioId: number, id: number) =>
    methods.get<AssetHolding>(`${PORTFOLIO_URL}/${portfolioId}/assets/${id}`);

  const getAssets = (portfolioId: number) =>
    methods.get<AssetHolding[]>(`${PORTFOLIO_URL}/${portfolioId}/assets`);

  const deleteAsset = (portfolioId: number, id: number) =>
    methods.delete<Asset>(`${PORTFOLIO_URL}/${portfolioId}/assets/${id}`);

  const createTx = (
    assetId: number,
    type: Transaction["type"],
    quantity = 1,
    price = 10,
    date = formatISO(new Date(), { representation: "date" })
  ) =>
    methods.post<Transaction>(TX_URL(assetId), {
      type,
      quantity,
      price,
      date,
    });

  const getTx = (assetId: number, id: number) =>
    methods.get<Transaction>(`${TX_URL(assetId)}/${id}`);

  const getTxs = (assetId: number) =>
    methods.get<Transaction[]>(TX_URL(assetId));

  const deleteTx = (assetId: number, id: number) =>
    methods.delete<Transaction>(`${TX_URL(assetId)}/${id}`);

  const lookupTicker = (ticker: string = `MSFT`) =>
    methods.get<TickerSearchResult>(`${TICKER_URL}?term=${ticker}`);

  return {
    createPortfolio,
    getPortfolio,
    deletePortfolio,
    getPortfolios,
    createAsset,
    getAsset,
    getAssets,
    deleteAsset,
    createTx,
    getTx,
    getTxs,
    deleteTx,
    getRefreshToken,
    lookupTicker,
  };
};

export type Api = ReturnType<typeof api>;
