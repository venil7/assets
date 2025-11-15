import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import type { Decoder } from "io-ts";
import { AppErrorMessageDecoder } from "../decoders/error";
import { liftTE } from "../decoders/util";
import {
  authError,
  generalError,
  handleError,
  validationError,
  type AppError,
} from "../domain";
import type { Action } from "../utils/utils";

const rest = <JSON>(
  url: string,
  { method, body, headers }: RequestInit,
  decoder: Decoder<any, JSON>
): Action<JSON> => {
  // console.info(`[${method}] ${url} ${body ?? "-"}`);
  const req = { method, body, headers } as RequestInit;
  return pipe(
    TE.tryCatch(() => fetch(url, req), handleError("fetch")),
    // TE.bindTo("resp"),
    // TE.bind("clone", ({ resp }) => TE.of(resp.clone())),
    TE.chain((resp) => {
      const clone = resp.clone();
      const toJson = TE.tryCatch(
        () => resp.json(),
        handleError("JSON parse error")
      );
      const toText = TE.tryCatch(
        () => clone.text(),
        handleError("TEXT parse error")
      );
      if (resp.status >= 200 && resp.status < 300) {
        return pipe(toJson, TE.chain(liftTE(decoder)));
      }

      return pipe(
        toJson,
        TE.chain(liftTE(AppErrorMessageDecoder)),
        TE.map(({ message }) => {
          switch (resp.status) {
            case 400:
              return validationError(message);
            case 401:
            case 403:
              return authError(message);
            case 404:
            default:
              return generalError(message);
          }
        }),
        TE.orElseW(() =>
          pipe(
            toText,
            TE.chain((message) =>
              TE.of<AppError, AppError>(
                generalError(`${resp.status}:${resp.statusText} - ${message}`)
              )
            )
          )
        ),
        TE.chain(TE.left)
      ) as Action<JSON>;
    })
  );
};

export const methods = (token: string = "") => {
  const headers = [
    ["content-type", "application/json"],
    ...(token ? [["authorization", `Bearer ${token}`]] : []),
  ] as [string, string][];

  const get = <TResult>(url: string, decoder: Decoder<any, TResult>) =>
    rest<TResult>(url, { method: "GET", headers }, decoder);
  const post = <TResult, TBody = {}>(
    url: string,
    body: TBody,
    decoder: Decoder<any, TResult>
  ) => {
    const jsonBody = JSON.stringify(body);
    return rest<TResult>(
      url,
      { method: "POST", body: jsonBody, headers },
      decoder
    );
  };
  const put = <TResult, TBody = {}>(
    url: string,
    body: TBody,
    decoder: Decoder<any, TResult>
  ) => {
    const jsonBody = JSON.stringify(body);
    return rest<TResult>(
      url,
      { method: "PUT", body: jsonBody, headers },
      decoder
    );
  };
  const delete1 = <TResult>(url: string, decoder: Decoder<any, TResult>) =>
    rest<TResult>(url, { method: "DELETE", headers }, decoder);
  return { get, post, delete: delete1, put };
};

export type Methods = ReturnType<typeof methods>;
