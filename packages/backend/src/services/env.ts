import {
  generalError,
  handleError,
  type Action,
  type AppError,
  type Nullable,
} from "@darkruby/assets-core";
import { flow, pipe } from "fp-ts/lib/function";
import * as IO from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import ms from "ms";

export const env = (
  name: string,
  defaultValue: Nullable<string> = null
): Action<string> =>
  pipe(
    IO.tryCatch(() => {
      const val = process.env[name] ?? defaultValue;
      if (val) return val;
      throw Error(`${name} is not defined`);
    }, handleError("Environment variable")),
    TE.fromIOEither
  );

export const envNumber = (
  name: string,
  defaultValue: Nullable<number> = null
): Action<number> =>
  pipe(
    env(name, defaultValue?.toString()),
    TE.chain((s) =>
      pipe(
        IO.tryCatch(() => parseFloat(s), handleError("parseFloat")),
        TE.fromIOEither
      )
    )
  );

// reads ms.StringValue fron env, returns number of milliseconds
export const envDurationMsec = (
  name: string,
  defaultValue: ms.StringValue
): Action<number /**milliseconds */> =>
  pipe(
    env(name, defaultValue),
    TE.map((s) => ms(s as ms.StringValue)),
    TE.filterOrElseW(
      (n) => n != undefined,
      () => generalError(`not an ms.StringValue`)
    ),
    TE.orElse(() => TE.of(ms(defaultValue)))
  );

export const envDurationSec = flow(
  envDurationMsec,
  TE.map((x) => x / 1000)
);

export const envBoolean = (
  name: string,
  defaultValue: Nullable<boolean> = null
): Action<boolean> =>
  pipe(
    env(name, defaultValue?.toString()),
    TE.map((s) => s.toLowerCase().trim() === "true")
  );

// Validates CORS origin with environment-aware defaults
export const validateCorsOrigin = (
  origin: Nullable<string>
): Action<string> =>
  pipe(
    TE.Do,
    TE.bind("nodeEnv", () => TE.of(process.env.NODE_ENV || "development")),
    TE.chain(({ nodeEnv }) => {
      // Development: allow localhost:5173 as fallback
      if (nodeEnv === "development") {
        return TE.of(origin || "http://localhost:5173");
      }

      // Production: REQUIRE explicit origin (don't assume)
      if (!origin) {
        return TE.left(
          generalError(
            "CORS_ORIGIN environment variable is required in production. " +
            "Set it to your frontend domain (e.g., https://yourdomain.com)"
          )
        );
      }

      // Validate origin uses HTTPS in production (security requirement)
      if (!origin.startsWith("https://") && !origin.includes("localhost")) {
        return TE.left(
          generalError(
            "CORS_ORIGIN must use HTTPS in production for security. " +
            `Got: ${origin}`
          )
        );
      }

      return TE.of(origin);
    })
  );

// Validates all required environment variables are set
export const validateEnvironment = (): Action<void> => {
  const required = [
    "ASSETS_DB",
    "ASSETS_APP",
    "ASSETS_JWT_SECRET",
  ];

  const optional = [
    { name: "ASSETS_PORT", default: "4020" },
    { name: "ASSETS_CACHE_SIZE", default: "1000" },
    { name: "ASSETS_CACHE_TTL", default: "5m" },
    { name: "CORS_ORIGIN", default: "http://localhost:5173 (dev only)" },
    { name: "LOG_LEVEL", default: "info" },
    { name: "NODE_ENV", default: "development" },
  ];

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    return TE.left(
      generalError(
        `Missing required environment variables:\n  ${missing.map((name) => `- ${name}`).join("\n  ")}\n\nOptional variables with defaults:\n  ${optional.map((opt) => `- ${opt.name} (default: ${opt.default})`).join("\n  ")}`
      )
    );
  }

  return TE.of(undefined);
};
