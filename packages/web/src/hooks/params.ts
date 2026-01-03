import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { NumberFromString } from "io-ts-types";
import { useParams } from "react-router";

const createStrictParamsHook =
  <T extends Record<string, any>>(
    decoder: t.Decoder<unknown, T>,
    defaultValue: () => T
  ) =>
  (): T => {
    return pipe(decoder.decode(useParams<T>()), E.getOrElse(defaultValue));
  };

export const useAssetParams = createStrictParamsHook<{
  assetId: number;
  portfolioId: number;
}>(
  t.type({
    assetId: NumberFromString,
    portfolioId: NumberFromString,
  }),
  () => ({ assetId: -1, portfolioId: -1 })
);

export const usePortfolioParams = createStrictParamsHook<{
  portfolioId: number;
}>(t.type({ portfolioId: NumberFromString }), () => ({ portfolioId: -1 }));
