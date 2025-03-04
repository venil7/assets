import { beforeAll, expect, test } from "bun:test";
import { authenticate, BASE_URL, run, type Methods } from "./index";

export const TICKER_URL = `${BASE_URL}/api/v1/lookup/ticker`;

var methods: Methods;

type Ticker = {
  exchange: string;
  shortname: string;
  quoteType: string;
  symbol: string;
  longname: string;
};
type TickerSearchResult = {
  quotes: Ticker[];
};

beforeAll(async () => {
  methods = await run(authenticate());
});

test("Lookup ticker", async () => {
  const { quotes } = await run(
    methods.get<TickerSearchResult>(`${TICKER_URL}?term=MSFT`)
  );
  expect(quotes).toBeArray();
  expect(quotes[0].symbol).toBe("MSFT");
});
