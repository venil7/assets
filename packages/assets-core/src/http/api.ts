import { pipe } from "fp-ts/lib/function";
import {
  EnrichedAssetDecoder,
  EnrichedAssetsDecoder,
  EnrichedPortfolioDecoder,
  EnrichedPortfoliosDecoder,
  EnrichedTxDecoder,
  EnrichedTxsDecoder,
  GetUserDecoder,
  GetUsersDecoder,
  IdDecoder,
  PrefsDecoder,
  SummaryDecoder,
  TokenDecoder,
  YahooTickerSearchResultDecoder,
  type ChartRange,
} from "../decoders";
import type {
  AssetId,
  Credentials,
  EnrichedAsset,
  EnrichedPortfolio,
  EnrichedTx,
  GetUser,
  Id,
  NewUser,
  PasswordChange,
  PortfolioId,
  PostAsset,
  PostPortfolio,
  PostTx,
  PostTxsUpload,
  PostUser,
  Prefs,
  Summary,
  TickerSearchResult,
  Token,
  TxId,
  UserId,
} from "../domain";
import type { Action } from "../utils/utils";
import * as rest from "./rest";

const getApi = (baseUrl: string) => (methods: rest.Methods) => {
  const API_URL = `${baseUrl}/api/v1`;
  const USERS_URL = `${API_URL}/users`;
  const USER_URL = (uid: UserId) => `${USERS_URL}/${uid}`;
  const SUMMARY_URL = (range?: ChartRange) => {
    const base = `${API_URL}/summary`;
    return range ? `${base}?range=${range}` : base;
  };
  const PORTFOLIOS_URL = (range?: ChartRange) => {
    const base = `${API_URL}/portfolios`;
    return range ? `${base}?range=${range}` : base;
  };
  const PROFILE_URL = `${API_URL}/profile`;
  const PREFS_URL = `${API_URL}/prefs`;
  const PORTFOLIO_URL = (portfolioId: number, range?: ChartRange) => {
    const base = `${PORTFOLIOS_URL()}/${portfolioId}`;
    return range ? `${base}?range=${range}` : base;
  };
  const ASSETS_URL = (portfolioId: number, range?: ChartRange) => {
    const base = `${PORTFOLIOS_URL()}/${portfolioId}/assets`;
    return range ? `${base}?range=${range}` : base;
  };
  const ASSET_URL = (
    portfolioId: number,
    assetId: number,
    range?: ChartRange
  ) => {
    const base = `${ASSETS_URL(portfolioId)}/${assetId}`;
    return range ? `${base}?range=${range}` : base;
  };
  const AUTH_URL = `${API_URL}/auth`;
  const REFRESH_TOKEN_URL = `${AUTH_URL}/refresh_token`;
  const TICKER_URL = `${API_URL}/lookup/ticker`;
  const TXS_URL = (portfolioId: PortfolioId, assetId: AssetId) =>
    `${API_URL}/portfolios/${portfolioId}/assets/${assetId}/tx`;
  const TX_URL = (portfolioId: PortfolioId, assetId: AssetId, txId: TxId) =>
    `${TXS_URL(portfolioId, assetId)}/${txId}`;
  const BULK_TX_URL = (portfolioId: PortfolioId, assetId: number) =>
    `${API_URL}/portfolios/${portfolioId}/assets/${assetId}/txs`;

  const getRefreshToken = () =>
    methods.get<Token>(REFRESH_TOKEN_URL, TokenDecoder);

  const getSummary = (range?: ChartRange) =>
    methods.get<Summary>(SUMMARY_URL(range), SummaryDecoder);

  const createPortfolio = (portfolio: PostPortfolio) =>
    methods.post<EnrichedPortfolio, PostPortfolio>(
      PORTFOLIOS_URL(),
      portfolio,
      EnrichedPortfolioDecoder
    );
  const updatePortfolio = (id: number, portfolio: PostPortfolio) =>
    methods.put<EnrichedPortfolio, PostPortfolio>(
      PORTFOLIO_URL(id),
      portfolio,
      EnrichedPortfolioDecoder
    );
  const getPortfolio = (portfolioId: number, range?: ChartRange) =>
    methods.get<EnrichedPortfolio>(
      PORTFOLIO_URL(portfolioId, range),
      EnrichedPortfolioDecoder
    );
  const deletePortfolio = (id: number) =>
    methods.delete<Id>(PORTFOLIO_URL(id), IdDecoder);
  const getPortfolios = (range?: ChartRange) =>
    methods.get<EnrichedPortfolio[]>(
      PORTFOLIOS_URL(range),
      EnrichedPortfoliosDecoder
    );

  const createAsset = (portfolioId: number, asset: PostAsset) =>
    methods.post<EnrichedAsset, PostAsset>(
      ASSETS_URL(portfolioId),
      asset,
      EnrichedAssetDecoder
    );
  const updateAsset = (
    assetId: number,
    portfolioId: number,
    asset: PostAsset
  ) =>
    methods.put<EnrichedAsset, PostAsset>(
      ASSET_URL(portfolioId, assetId),
      asset,
      EnrichedAssetDecoder
    );
  const getAsset = (portfolioId: number, assetId: number, range?: ChartRange) =>
    methods.get<EnrichedAsset>(
      ASSET_URL(portfolioId, assetId, range),
      EnrichedAssetDecoder
    );
  const getAssets = (portfolioId: number, range?: ChartRange) =>
    methods.get<EnrichedAsset[]>(
      `${ASSETS_URL(portfolioId, range)}`,
      EnrichedAssetsDecoder
    );
  const deleteAsset = (portfolioId: number, id: number) =>
    methods.delete<Id>(ASSET_URL(portfolioId, id), IdDecoder);

  const createTx = (pId: PortfolioId, assetId: AssetId, tx: PostTx) =>
    methods.post<EnrichedTx, PostTx>(
      TXS_URL(pId, assetId),
      tx,
      EnrichedTxDecoder
    );
  const updateTx = (
    pId: PortfolioId,
    assetId: AssetId,
    txId: TxId,
    tx: PostTx
  ) =>
    methods.put<EnrichedTx, PostTx>(
      TX_URL(pId, assetId, txId),
      tx,
      EnrichedTxDecoder
    );
  const getTx = (pId: PortfolioId, assetId: AssetId, txId: TxId) =>
    methods.get<EnrichedTx>(TX_URL(pId, assetId, txId), EnrichedTxDecoder);
  const getTxs = (pId: PortfolioId, assetId: AssetId) =>
    methods.get<EnrichedTx[]>(TXS_URL(pId, assetId), EnrichedTxsDecoder);
  const deleteTx = (pId: PortfolioId, assetId: AssetId, txId: number) =>
    methods.delete<Id>(TX_URL(pId, assetId, txId), IdDecoder);
  const deleteAllAsset = (pId: PortfolioId, assetId: AssetId) =>
    methods.delete<Id>(BULK_TX_URL(pId, assetId), IdDecoder);
  const uploadAsset = (
    pId: PortfolioId,
    assetId: AssetId,
    payload: PostTxsUpload
  ) =>
    methods.post<EnrichedTx[]>(
      BULK_TX_URL(pId, assetId),
      payload,
      EnrichedTxsDecoder
    );

  const getProfile = () => methods.get<GetUser>(PROFILE_URL, GetUserDecoder);
  const updateProfile = (body: PostUser) =>
    methods.put<GetUser, PostUser>(PROFILE_URL, body, GetUserDecoder);
  const updatePassword = (body: PasswordChange) =>
    methods.post<GetUser, PasswordChange>(PROFILE_URL, body, GetUserDecoder);
  const deleteProfile = () => methods.delete<Id>(PROFILE_URL, IdDecoder);

  const getPrefs = () => methods.get<Prefs>(PREFS_URL, PrefsDecoder);
  const updatePrefs = (pref: Prefs) =>
    methods.put<Prefs>(PREFS_URL, pref, PrefsDecoder);

  const createUser = (body: NewUser) =>
    methods.post<GetUser, NewUser>(USERS_URL, body, GetUserDecoder);
  const updateUser = (uid: UserId, body: PostUser) =>
    methods.put<GetUser, PostUser>(USER_URL(uid), body, GetUserDecoder);
  const getUsers = () => methods.get<GetUser[]>(USERS_URL, GetUsersDecoder);
  const getUser = (uid: UserId) =>
    methods.get<GetUser>(USER_URL(uid), GetUserDecoder);
  const deleteUser = (uid: UserId) =>
    methods.delete<Id>(USER_URL(uid), IdDecoder);

  const lookupTicker = (ticker: string) =>
    methods.get<TickerSearchResult>(
      `${TICKER_URL}?term=${ticker}`,
      YahooTickerSearchResultDecoder
    );

  return {
    user: {
      get: getUser,
      getMany: getUsers,
      update: updateUser,
      create: createUser,
      delete: deleteUser,
    },
    profile: {
      get: getProfile,
      update: updateProfile,
      password: updatePassword,
      delete: deleteProfile,
    },
    prefs: {
      get: getPrefs,
      update: updatePrefs,
    },
    summary: {
      get: getSummary,
    },
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
      deleteAllAsset: deleteAllAsset,
      uploadAsset: uploadAsset,
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
  (creds: Credentials): Action<Token> => {
    const LOGIN_URL = `${baseUrl}/login`;
    return rest.methods().post<Token>(LOGIN_URL, creds, TokenDecoder);
  };

export const api =
  (baseUrl: string) =>
  ({ token }: Token) =>
    pipe(rest.methods(token), getApi(baseUrl));

export type Api = ReturnType<ReturnType<typeof getApi>>;
