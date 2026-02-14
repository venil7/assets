import type { Ccy, EnrichedAsset } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { useFormatters } from "../../hooks/prefs";
import { HorizontalStack } from "../Layout/Stack";

export type AssetDetailsProps = {
  asset: EnrichedAsset;
};

export const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  const { money, decimal, percent } = useFormatters();
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
            <span>{decimal(asset.holdings)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost</strong>
            <span>{money(asset.avg_price, asset.meta.currency as Ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost</strong>
            <span>{money(asset.invested, asset.meta.currency as Ccy)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain</strong>
            <span>
              {money(asset.ccy.realizedGain, asset.meta.currency as Ccy)} (
              {percent(asset.ccy.realizedGainPct)})
            </span>
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush" hidden={asset.domestic}>
          <ListGroup.Item>
            <strong>Unrealized FX impact</strong>
            <span>{money(asset.base.fxImpact)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost (base)</strong>
            <span>{money(asset.base.avgPrice)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost (base)</strong>
            <span>{money(asset.base.invested)}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Realized gain (base)</strong>
            <span>
              {money(asset.base.realizedGain)} (
              {percent(asset.base.realizedGainPct)})
            </span>
          </ListGroup.Item>
        </ListGroup>
      </HorizontalStack>
    </div>
  );
};
