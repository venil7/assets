import type { Ccy, EnrichedAsset } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Decimal, Money } from "../Formatting";
import { HorizontalStack } from "../Layout/Stack";

export type AssetDetailsProps = {
  asset: EnrichedAsset;
};

export const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  const assetCcy = asset.meta.currency as Ccy;
  return (
    <div className="asset-details-tab">
      <HorizontalStack>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Type</strong>
            <span>{asset.meta.instrumentType}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Ticker</strong>
            <span>{asset.meta.symbol}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Exchange</strong>
            <span>{asset.meta.exchangeName}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Currency</strong>
            <span>{asset.meta.currency}</span>
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Holdings</strong>
            <Decimal value={asset.holdings} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost</strong>
            <Money value={asset.avg_price} ccy={assetCcy} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost</strong>
            <Money value={asset.invested} ccy={assetCcy} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain</strong>
            <Money value={asset.realized_pnl} ccy={assetCcy} />
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush" hidden={asset.base.domestic}>
          <ListGroup.Item>
            <strong>FX impact</strong>
            <Money value={asset.base.fxImpact} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost (base)</strong>
            <Money value={asset.base.avgPrice} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost (base)</strong>
            <Money value={asset.base.invested} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain (base)</strong>
            <Money value={asset.base.realizedPnl} />
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
