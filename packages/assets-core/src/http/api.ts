import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { YahooTickerSearchResultDecoder } from "../decoders";
import { GetAssetDecoder, GetAssetsDecoder } from "../decoders/asset";
import {
  GetPortfolioDecoder,
  GetPortfoliosDecoder,
} from "../decoders/portfolio";
import { TokenDecoder } from "../decoders/token";
import { GetTxDecoder, GetTxsDecoder } from "../decoders/transaction";
import { IdDecoder } from "../decoders/util";
import type {
  GetAsset,
  GetPortfolio,
  GetTransaction,
  PostAsset,
  PostPortfolio,
  PostTransaction,
  TickerSearchResult,
} from "../domain";
import type { Id } from "../domain/id";
import type { Token } from "../domain/token";
import { type Methods, methods as getMethods } from "./rest";

const getApi = (methods: Methods, baseUrl: string) => {
  const API_URL = `${baseUrl}/api/v1`;
  const PORTFOLIO_URL = `${API_URL}/portfolios`;
  const ASSETS_URL = (portfolioId: number) =>
    `${PORTFOLIO_URL}/${portfolioId}/assets`;
  const AUTH_URL = `${API_URL}/auth`;
  const REFRESH_TOKEN_URL = `${AUTH_URL}/refresh_token`;
  const TICKER_URL = `${API_URL}/lookup/ticker`;
  const TX_URL = (assetId: number) =>
    `${API_URL}/assets/${assetId}/transactions`;

  const getRefreshToken = () =>
    methods.get<Token>(REFRESH_TOKEN_URL, TokenDecoder);

  const createPortfolio = (portfolio: PostPortfolio) =>
    methods.post<GetPortfolio, PostPortfolio>(
      `${PORTFOLIO_URL}/`,
      portfolio,
      GetPortfolioDecoder
    );
  const getPortfolio = (id: number) =>
    methods.get<GetPortfolio>(`${PORTFOLIO_URL}/${id}`, GetPortfolioDecoder);
  const deletePortfolio = (id: number) =>
    methods.delete<Id>(`${PORTFOLIO_URL}/${id}`, IdDecoder);
  const getPortfolios = () =>
    methods.get<GetPortfolio[]>(`${PORTFOLIO_URL}/`, GetPortfoliosDecoder);

  const createAsset = (portfolioId: number, asset: PostAsset) =>
    methods.post<GetAsset, PostAsset>(
      ASSETS_URL(portfolioId),
      asset,
      GetAssetDecoder
    );
  const getAsset = (portfolioId: number, id: number) =>
    methods.get<GetAsset>(`${ASSETS_URL(portfolioId)}/${id}`, GetAssetDecoder);
  const getAssets = (portfolioId: number) =>
    methods.get<GetAsset[]>(`${ASSETS_URL(portfolioId)}`, GetAssetsDecoder);
  const deleteAsset = (portfolioId: number, id: number) =>
    methods.delete<Id>(`${ASSETS_URL(portfolioId)}/${id}`, IdDecoder);

  const createTx = (assetId: number, tx: PostTransaction) =>
    methods.post<GetTransaction, PostTransaction>(
      TX_URL(assetId),
      tx,
      GetTxDecoder
    );
  const getTx = (assetId: number, id: number) =>
    methods.get<GetTransaction>(`${TX_URL(assetId)}/${id}`, GetTxDecoder);
  const getTxs = (assetId: number) =>
    methods.get<GetTransaction[]>(TX_URL(assetId), GetTxsDecoder);
  const deleteTx = (assetId: number, id: number) =>
    methods.delete<Id>(`${TX_URL(assetId)}/${id}`, IdDecoder);

  const lookupTicker = (ticker: string = `MSFT`) =>
    methods.get<TickerSearchResult>(
      `${TICKER_URL}?term=${ticker}`,
      YahooTickerSearchResultDecoder
    );

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

export const login =
  (baseUrl: string) => (username: string, password: string) => {
    const LOGIN_URL = `${baseUrl}/login`;
    return pipe(
      getMethods().post<{ token: string }>(
        LOGIN_URL,
        { username, password },
        TokenDecoder
      )
    );
  };

export const api = (baseUrl: string) => (username: string, password: string) =>
  pipe(
    login(baseUrl)(username, password),
    TE.map(({ token }) => getMethods(token)),
    TE.map((m) => getApi(m, baseUrl))
  );

export type Api = ReturnType<typeof getApi>;
