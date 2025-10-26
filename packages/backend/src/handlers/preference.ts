import {
  GetPreferenceDecoder,
  PostPreferenceDecoder,
  type GetPreference,
} from "@darkruby/assets-core";
import { liftTE } from "@darkruby/assets-core/src/decoders/util";
import { type HandlerTask } from "@darkruby/fp-express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toWebError } from "../domain/error";
import { getUserId } from "./auth";
import type { Context } from "./context";

export const getPreference: HandlerTask<GetPreference, Context> = ({
  params: [, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("preference", ({ userId }) => repo.preference.get(userId)),
    TE.chain(({ preference }) => liftTE(GetPreferenceDecoder)(preference)),
    TE.mapLeft(toWebError)
  );

export const updatePreference: HandlerTask<GetPreference, Context> = ({
  params: [req, res],
  context: { repo },
}) =>
  pipe(
    TE.Do,
    TE.bind("userId", () => getUserId(res)),
    TE.bind("preference", () => pipe(req.body, liftTE(PostPreferenceDecoder))),
    TE.chain(({ userId, preference }) =>
      pipe(
        repo.preference.update(userId, preference),
        TE.chain(() => repo.preference.get(userId))
      )
    ),
    TE.mapLeft(toWebError)
  );
