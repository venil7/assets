import "dotenv/config";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";

export const BASE_URL = `http://${process.env.URL ?? "localhost:8080"}`;
export const LOGIN_URL = `${BASE_URL}/login`;

export const USERNAME = "admin";
export const PASSWORD = "admin";

export type TES<A> = TE.TaskEither<string, A>;

const rest = <JSON>(
  url: string,
  { method, body, headers }: RequestInit
): TES<JSON> => {
  console.info(`[${method}] ${url} ${body ?? ""}`);
  const req = { method, body, headers } as RequestInit;
  return pipe(
    () => fetch(url, req),
    T.map((resp) => E.right({ resp })),
    TE.bind("body", ({ resp }) =>
      TE.tryCatch(
        () => resp.json() as Promise<JSON>,
        () => "json_failed"
      )
    ),
    TE.chain(({ resp, body }) =>
      resp.status >= 200 && resp.status < 300
        ? TE.of(body)
        : TE.left((body as any).error)
    )
  );
};

export const methods = (token: string = "") => {
  const headers = [
    ["content-type", "application/json"],
    ["Authorization", `Bearer ${token}`],
  ] as [string, string][];

  const get = <TResult>(url: string) =>
    rest<TResult>(url, { method: "GET", headers });
  const post = <TResult>(url: string, body: {}) =>
    rest<TResult>(url, { method: "POST", body: JSON.stringify(body), headers });
  const delete1 = <TResult>(url: string) =>
    rest<TResult>(url, { method: "DELETE", headers });
  return { get, post, delete: delete1 };
};

const { post } = methods();

export const login = (username = USERNAME, password = PASSWORD) =>
  pipe(post<{ token: string }>(LOGIN_URL, { username, password }));

export const authenticate = (username = USERNAME, password = PASSWORD) =>
  pipe(
    login(username, password),
    TE.map(({ token }) => methods(token))
  );

export const run = async <A>(test: TES<A>) => {
  const result = await test();
  if (E.isLeft(result)) {
    throw new Error(result.left);
  }
  return result.right;
};

export type Methods = ReturnType<typeof methods>;
