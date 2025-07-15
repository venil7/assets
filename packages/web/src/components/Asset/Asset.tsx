import {
  type EnrichedAsset,
  type GetAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { RangeChart } from "../Charts/RangesChart";
import { TxList } from "../Tx/TxList";

type AssetProps = {
  txs: GetTx[];
  asset: EnrichedAsset;
  onEdit: (a: GetAsset) => void;
  onAddTx: (tx: PostTx) => void;
  onEditTx: (txid: number, tx: PostTx) => void;
  onDeleteTx: (txid: number) => void;
  onRange: (rng: ChartRange) => void;
};

const RawAsset: React.FC<AssetProps> = ({
  asset,
  txs,
  onEditTx,
  onDeleteTx,
  onAddTx,
  onRange,
}: AssetProps) => {
  return (
    <div className="asset-details">
      <RangeChart
        onChange={onRange}
        data={asset.chart.base}
        range={asset.meta.range}
        ranges={asset.meta.validRanges}
      />
      <TxList
        txs={txs}
        asset={asset}
        onAdd={onAddTx}
        onEdit={onEditTx}
        onDelete={onDeleteTx}
      />
    </div>
  );
};

export const Asset = pipe(
  RawAsset,
  withNoData<AssetProps, "asset">((p) => p.asset),
  withFetching,
  withError
);
