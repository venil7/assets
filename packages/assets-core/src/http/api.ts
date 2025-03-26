import { pipe } from "fp-ts/lib/function";
import { YahooTickerSearchResultDecoder } from "../decoders";
import { EnrichedAssetDecoder, EnrichedAssetsDecoder } from "../decoders/asset";
import { IdDecoder } from "../decoders/id";
import {
  EnrichedPortfolioDecoder,
  EnrichedPortfoliosDecoder,
} from "../decoders/portfolio";
import { TokenDecoder } from "../decoders/token";
import { GetTxDecoder, GetTxsDecoder } from "../decoders/transaction";
import type {
  Credentials,
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
import type { Action } from "../utils/utils";
import * as rest from "./rest";

const getApi = (baseUrl: string) => (methods: rest.Methods) => {
  const API_URL = `${baseUrl}/api/v1`;
  const PORTFOLIOS_URL = `${API_URL}/portfolios`;
  const PORTFOLIO_URL = (id: number) => `${PORTFOLIOS_URL}/${id}`;
  const ASSETS_URL = (portfolioId: number) =>
    `${PORTFOLIOS_URL}/${portfolioId}/assets`;
  const ASSET_URL = (portfolioId: number, assetId: number) =>
    `${ASSETS_URL(portfolioId)}/${assetId}`;
  const AUTH_URL = `${API_URL}/auth`;
  const REFRESH_TOKEN_URL = `${AUTH_URL}/refresh_token`;
  const TICKER_URL = `${API_URL}/lookup/ticker`;
  const TXS_URL = (assetId: number) =>
    `${API_URL}/assets/${assetId}/transactions`;
  const TX_URL = (assetId: number, txId: number) =>
    `${TXS_URL(assetId)}/${txId}`;

  const getRefreshToken = () =>
    methods.get<Token>(REFRESH_TOKEN_URL, TokenDecoder);

  const createPortfolio = (portfolio: PostPortfolio) =>
    methods.post<GetPortfolio, PostPortfolio>(
      PORTFOLIOS_URL,
      portfolio,
      EnrichedPortfolioDecoder
    );
  const updatePortfolio = (id: number, portfolio: PostPortfolio) =>
    methods.put<GetPortfolio, PostPortfolio>(
      PORTFOLIO_URL(id),
      portfolio,
      EnrichedPortfolioDecoder
    );
  const getPortfolio = (id: number) =>
    methods.get<GetPortfolio>(PORTFOLIO_URL(id), EnrichedPortfolioDecoder);
  const deletePortfolio = (id: number) =>
    methods.delete<Id>(PORTFOLIO_URL(id), IdDecoder);
  const getPortfolios = () =>
    methods.get<GetPortfolio[]>(PORTFOLIOS_URL, EnrichedPortfoliosDecoder);

  const createAsset = (portfolioId: number, asset: PostAsset) =>
    methods.post<GetAsset, PostAsset>(
      ASSETS_URL(portfolioId),
      asset,
      EnrichedAssetDecoder
    );
  const updateAsset = (
    assetId: number,
    portfolioId: number,
    asset: PostAsset
  ) =>
    methods.put<GetAsset, PostAsset>(
      ASSET_URL(portfolioId, assetId),
      asset,
      EnrichedAssetDecoder
    );
  const getAsset = (portfolioId: number, id: number) =>
    methods.get<GetAsset>(ASSET_URL(portfolioId, id), EnrichedAssetDecoder);
  const getAssets = (portfolioId: number) =>
    methods.get<GetAsset[]>(
      `${ASSETS_URL(portfolioId)}`,
      EnrichedAssetsDecoder
    );
  const deleteAsset = (portfolioId: number, id: number) =>
    methods.delete<Id>(ASSET_URL(portfolioId, id), IdDecoder);

  const createTx = (assetId: number, tx: PostTransaction) =>
    methods.post<GetTransaction, PostTransaction>(
      TXS_URL(assetId),
      tx,
      GetTxDecoder
    );
  const updateTx = (txId: number, assetId: number, tx: PostTransaction) =>
    methods.put<GetTransaction, PostTransaction>(
      TX_URL(assetId, txId),
      tx,
      GetTxDecoder
    );
  const getTx = (assetId: number, id: number) =>
    methods.get<GetTransaction>(TX_URL(assetId, id), GetTxDecoder);
  const getTxs = (assetId: number) =>
    methods.get<GetTransaction[]>(TXS_URL(assetId), GetTxsDecoder);
  const deleteTx = (assetId: number, id: number) =>
    methods.delete<Id>(TX_URL(assetId, id), IdDecoder);

  const lookupTicker = (ticker: string) =>
    methods.get<TickerSearchResult>(
      `${TICKER_URL}?term=${ticker}`,
      YahooTickerSearchResultDecoder
    );

  return {
    portfolio: {
      get: getPortfolio,
      getMany: getPortfolios,
      create: createPortfolio,
      update: updatePortfolio,
      delete: deletePortfolio,
    },
    asset: {
      get: getAsset,
      getMany: getAssets,
      create: createAsset,
      update: updateAsset,
      delete: deleteAsset,
    },
    tx: {
      get: getTx,
      getMany: getTxs,
      create: createTx,
      update: updateTx,
      delete: deleteTx,
    },
    auth: {
      refreshToken: getRefreshToken,
    },
    yahoo: {
      lookupTicker,
    },
  };
};

export const login =
  (baseUrl: string) =>
  (form: Credentials): Action<Token> => {
    const LOGIN_URL = `${baseUrl}/login`;
    return rest
      .methods()
      .post<{ token: string }>(LOGIN_URL, form, TokenDecoder);
  };

export const api =
  (baseUrl: string) =>
  ({ token }: Token) =>
    pipe(rest.methods(token), getApi(baseUrl));

export type Api = ReturnType<ReturnType<typeof getApi>>;
