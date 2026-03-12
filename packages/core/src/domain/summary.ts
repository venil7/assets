import * as t from "io-ts";
import type { EnrichedSummaryDecoder } from "../decoders";

export type EnrichedSummary = t.TypeOf<typeof EnrichedSummaryDecoder>;
