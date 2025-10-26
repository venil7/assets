import { pipe } from "fp-ts/lib/function";
import {
  PreferencesDecoder,
  YahooTickerSearchResultDecoder,
} from "../decoders";
import { EnrichedAssetDecoder, EnrichedAssetsDecoder } from "../decoders/asset";
import { IdDecoder } from "../decoders/id";
import {
  EnrichedPortfolioDecoder,
  EnrichedPortfoliosDecoder,
} from "../decoders/portfolio";
import { SummaryDecoder } from "../decoders/summary";
import { TokenDecoder } from "../decoders/token";
import { GetTxDecoder, GetTxsDecoder } from "../decoders/transaction";
import { ProfileDecoder, ProfilesDecoder } from "../decoders/user";
import type { ChartRange } from "../decoders/yahoo/meta";
import type {
  Credentials,
  EnrichedAsset,
  EnrichedPortfolio,
  GetTx,
  PostAsset,
  PostPortfolio,
  PostTx,
  Preferences,
  Profile,
  Summary,
  TickerSearchResult,
  UserId,
} from "../domain";
import type { Id } from "../domain/id";
import type { Token } from "../domain/token";
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
  const PREFERENCES_URL = `${API_URL}/preference`;
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
  const TXS_URL = (assetId: number) => `${API_URL}/assets/${assetId}/tx`;
  const TX_URL = (assetId: number, txId: number) =>
    `${TXS_URL(assetId)}/${txId}`;

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

  const createTx = (assetId: number, tx: PostTx) =>
    methods.post<GetTx, PostTx>(TXS_URL(assetId), tx, GetTxDecoder);
  const updateTx = (txId: number, assetId: number, tx: PostTx) =>
    methods.put<GetTx, PostTx>(TX_URL(assetId, txId), tx, GetTxDecoder);
  const getTx = (assetId: number, id: number) =>
    methods.get<GetTx>(TX_URL(assetId, id), GetTxDecoder);
  const getTxs = (assetId: number) =>
    methods.get<GetTx[]>(TXS_URL(assetId), GetTxsDecoder);
  const deleteTx = (assetId: number, id: number) =>
    methods.delete<Id>(TX_URL(assetId, id), IdDecoder);

  const getProfile = () => methods.get<Profile>(PROFILE_URL, ProfileDecoder);
  const updateProfile = (body: Credentials) =>
    methods.put<Profile, Credentials>(PROFILE_URL, body, ProfileDecoder);

  const getPreferences = () =>
    methods.get<Preferences>(PREFERENCES_URL, PreferencesDecoder);
  const updatePreferences = (pref: Preferences) =>
    methods.put<Preferences>(PREFERENCES_URL, pref, PreferencesDecoder);

  const createUser = (body: Credentials) =>
    methods.post<Profile, Credentials>(USERS_URL, body, ProfileDecoder);
  const updateUser = (uid: UserId, body: Credentials) =>
    methods.put<Profile, Credentials>(USER_URL(uid), body, ProfileDecoder);
  const getUsers = () => methods.get<Profile[]>(USERS_URL, ProfilesDecoder);
  const getUser = (uid: UserId) =>
    methods.get<Profile>(USER_URL(uid), ProfileDecoder);
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
    },
    preferences: {
      get: getPreferences,
      update: updatePreferences,
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
