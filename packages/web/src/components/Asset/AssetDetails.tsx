import type { Ccy, EnrichedAsset } from "@darkruby/assets-core";
import * as React from "react";
import { ListGroup } from "react-bootstrap";
import { Decimal, Money, Percent } from "../Formatting";
import { HorizontalStack } from "../Layout/Stack";

export type AssetDetailsProps = {
  asset: EnrichedAsset;
};

export const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  const range = Math.abs(
    asset.meta.fiftyTwoWeekHigh - asset.meta.fiftyTwoWeekLow
  );
  const volatility =
    range / ((asset.meta.fiftyTwoWeekHigh + asset.meta.fiftyTwoWeekLow) / 2);

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
            <strong>52wk max</strong>
            <Money value={asset.meta.fiftyTwoWeekHigh} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>52wk min</strong>
            <Money value={asset.meta.fiftyTwoWeekLow} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Range</strong>
            <Money value={range} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Volatility</strong>
            <Percent value={volatility} nocolor />
          </ListGroup.Item>
        </ListGroup>

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Holdings</strong>
            <Decimal value={asset.holdings} />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Avg unit cost</strong>
            <Money value={asset.avg_price} ccy={assetCcy} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost</strong>
            <Money value={asset.invested} ccy={assetCcy} nocolor />
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
            <Money value={asset.base.avgPrice} nocolor />
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total cost (base)</strong>
            <Money value={asset.base.invested} nocolor />
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
