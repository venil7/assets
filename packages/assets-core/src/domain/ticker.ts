export type Ticker = {
  exchange: string;
  shortname: string;
  quoteType: string;
  symbol: string;
  longname: string;
};

export type TickerSearchResult = {
  quotes: Ticker[];
};
