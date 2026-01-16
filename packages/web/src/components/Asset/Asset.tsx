import {
  type Ccy,
  type EnrichedAsset,
  type EnrichedTx,
  type GetAsset,
  type PostTx,
  type PostTxsUpload,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { useFormatters } from "../../hooks/prefs";
import { RangeChart } from "../Charts/RangesChart";
import { TabContent, Tabs } from "../Form/Tabs";
import { HorizontalStack } from "../Layout/Stack";
import { Totals } from "../Totals/Totals";
import { TxList } from "../Tx/TxList";
import "./Asset.scss";
import { AssetDetails } from "./AssetDetails";

type AssetProps = {
  txs: EnrichedTx[];
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
  const { money, decimal } = useFormatters();
  return (
    <div className="asset-details">
      <HorizontalStack className="top-toolbar">
        <div className="flex-column">
          <h3>
            {asset.name} ({asset.ticker})
          </h3>
          <h5>
            {money(asset.meta.regularMarketPrice, asset.meta.currency as Ccy)}
          </h5>
        </div>
        <Totals
          totals={asset.totals.base}
          change={asset.value.base}
          range={asset.meta.range}
        />
      </HorizontalStack>
      <Tabs tabs={["Chart", "Details"]}>
        <TabContent tab={0}>
          <RangeChart
            onChange={onRange}
            data={asset.chart.base}
            range={asset.meta.range}
            ranges={asset.meta.validRanges}
          />
        </TabContent>
        <TabContent tab={1}>
          <AssetDetails asset={asset} />
        </TabContent>
      </Tabs>
      <TxList
        items={txs}
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
