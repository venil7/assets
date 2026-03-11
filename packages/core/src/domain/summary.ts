import * as t from "io-ts";
import type { SummaryDecoder } from "../decoders";

export type Summary = t.TypeOf<typeof SummaryDecoder>;
