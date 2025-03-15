import * as t from "io-ts";
import type { IdDecoder } from "../decoders/util";

export type Id = t.TypeOf<typeof IdDecoder>;
