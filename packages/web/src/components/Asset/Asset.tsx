import {
  type EnrichedAsset,
  type GetAsset,
  type GetTx,
  type PostTx,
  type PostTxsUpload,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { RangeChart } from "../Charts/RangesChart";
import { HorizontalStack } from "../Layout/Stack";
import { Totals } from "../Totals/Totals";
import { TxList } from "../Tx/TxList";

type AssetProps = {
  txs: GetTx[];
  asset: EnrichedAsset;
  onEdit: (a: GetAsset) => void;
  onAddTx: (tx: PostTx) => void;
  onEditTx: (txid: number, tx: PostTx) => void;
  onDeleteTx: (txid: number) => void;
  onRange: (rng: ChartRange) => void;
  onDeleteAll: () => void;
  onUploadTxs: (txs: PostTxsUpload) => void;
};

const RawAsset: React.FC<AssetProps> = ({
  asset,
  txs,
  onEditTx,
  onDeleteTx,
  onAddTx,
  onRange,
  onDeleteAll,
  onUploadTxs,
}: AssetProps) => {
  return (
    <div className="asset-details">
      <HorizontalStack className="top-toolbar">
        <h3>
          {asset.name} ({asset.ticker}){" "}
        </h3>
        <Totals
          totals={asset.totals.base}
          change={asset.value.base}
          range={asset.meta.range}
        />
      </HorizontalStack>
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
        onDeleteAll={onDeleteAll}
        onUploadTxs={onUploadTxs}
      />
    </div>
  );
};

export const Asset = pipe(
  RawAsset,
  withNoData<AssetProps, "asset">((p) => p.asset),
  withError,
  withFetching
);
