import * as t from "io-ts";
import type { UnixDateDecoder } from "../decoders/date";

export type UnixDate = t.TypeOf<typeof UnixDateDecoder>;
