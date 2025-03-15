import * as t from "io-ts";
import type { TokenDecoder } from "../decoders/token";

export type Token = t.TypeOf<typeof TokenDecoder>;
