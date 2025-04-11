import {
  defaultBuyTx,
  type GetAsset,
  type GetTx,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { Button, type ButtonProps } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { TabContent, Tabs } from "../Form/Tabs";
import { HorizontalStack } from "../Layout/Stack";
import { TxList } from "../Tx/TxList";
import { txModal } from "../Tx/TxModal";

type AssetProps = {
  asset: GetAsset;
  txs: GetTx[];
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
  const handleAddTx = pipe(() => txModal(defaultBuyTx()), TE.map(onAddTx));

  return (
    <div className="asset-details">
      <HorizontalStack className="top-toolbar">
        <AddBtn onClick={handleAddTx} />
      </HorizontalStack>

      <Tabs tabs={["Transactions", "Details"]}>
        <TabContent tab={0}>
          <TxList txs={txs} onEdit={onEditTx} onDelete={onDeleteTx} />
        </TabContent>
        <TabContent tab={1}>kkksjdksjsdj</TabContent>
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

const AddBtn = pipe(
  Button,
  withProps({
    size: "sm",
    variant: "outline-primary",
    children: "[+] Add Tx",
  })
) as React.FC<ButtonProps>;
