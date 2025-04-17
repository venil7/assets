import {
  type EnrichedAsset,
  type GetAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { money } from "../../util/number";
import { Chart } from "../Charts/Chart";
import { TabContent, Tabs } from "../Form/Tabs";
import { TxList } from "../Tx/TxList";

type AssetProps = {
  txs: GetTx[];
  asset: EnrichedAsset;
  onEdit: (a: GetAsset) => void;
  onAddTx: (tx: PostTx) => void;
  onEditTx: (txid: number, tx: PostTx) => void;
  onDeleteTx: (txid: number) => void;
};

const RawAsset: React.FC<AssetProps> = ({
  asset,
  txs,
  onEditTx,
  onDeleteTx,
  onAddTx,
}: AssetProps) => {
  const currencyMoney = (n: number) => money(n, asset.meta.currency);
  const baseMoney = (n: number) => money(n);
  return (
    <div className="asset-details">
      <Tabs tabs={["Details", "Transactions"]}>
        <TabContent tab={0}>
          <Chart data={asset.chart.base} priceFormatter={baseMoney} />
          {/* <Chart data={asset.chart.ccy} priceFormatter={currencyMoney} /> */}
        </TabContent>
        <TabContent tab={1}>
          <TxList
            txs={txs}
            asset={asset}
            onAdd={onAddTx}
            onEdit={onEditTx}
            onDelete={onDeleteTx}
          />
        </TabContent>
      </Tabs>
    </div>
  );
};

export const Asset = pipe(
  RawAsset,
  withNoData<AssetProps, "asset">((p) => p.asset),
  withFetching,
  withError
);
