import * as t from "io-ts";
import type { IdDecoder } from "../decoders";

export type Id = t.TypeOf<typeof IdDecoder>;
