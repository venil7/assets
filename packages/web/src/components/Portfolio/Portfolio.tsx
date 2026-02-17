import {
  defaultAsset,
  type AssetId,
  type EnrichedAsset,
  type EnrichedPortfolio,
  type PortfolioId,
  type PostAsset,
  type PostPortfolio,
  type PostTx
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Stack } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { assetModal } from "../Asset/AssetFields";
import { AssetLink } from "../Asset/AssetLink";
import { RangeChart } from "../Charts/RangesChart";
import { Info } from "../Form/Alert";
import { AddBtn } from "../Form/Button";
import { TabContent, Tabs } from "../Form/Tabs";
import { HorizontalStack } from "../Layout/Stack";
import { Totals } from "../Totals/Totals";
import { PortfolioDetails } from "./PortfolioDetails";

type PortfolioProps = {
  portfolio: EnrichedPortfolio;
  assets: EnrichedAsset[];
  onUpdate: (p: PostPortfolio) => void;
  onAddAsset: (a: PostAsset) => void;
  onAddTx: (aid: AssetId, a: PostTx) => void;
  onUpdateAsset: (aid: AssetId, a: PostAsset) => void;
  onDeleteAsset: (aid: AssetId) => void;
  onMoveAsset: (aid: AssetId, npid: PortfolioId) => void;
  onRange: (r: ChartRange) => void;
};

const RawPortfolioDetails: React.FC<PortfolioProps> = ({
  portfolio,
  assets,
  onUpdate,
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset,
  onRange,
  onAddTx,
  onMoveAsset
}: PortfolioProps) => {
  const handleAddAsset = () =>
    pipe(() => assetModal(defaultAsset()), TE.map(onAddAsset))();
  const handleUpdateAsset = (assetId: AssetId) => (asset: PostAsset) =>
    onUpdateAsset(assetId, asset);
  const handleAddTx = (assetId: AssetId) => (t: PostTx) => onAddTx(assetId, t);
  const handleDeleteAsset = (assetId: AssetId) => () => onDeleteAsset(assetId);

  const handleMoveAsset = (assetId: AssetId) => (npid: PortfolioId) =>
    onMoveAsset(assetId, npid);

  // const handleUpdate = () =>
  //   pipe(() => portfolioModal(portfolio), TE.map(onUpdate));

  return (
    <>
      <div className="portfolio-details">
        <HorizontalStack className="top-toolbar">
          <AddBtn onClick={handleAddAsset} label="Asset" />
          <Totals
            change={portfolio.base.changes}
            totals={portfolio.base.totals}
            range={portfolio.meta.range}
          />
        </HorizontalStack>
        <Info hidden={!!assets.length}>
          This portfolio doesn have any assets yet
        </Info>

        <Tabs tabs={["Chart", "Details"]} hidden={!portfolio.num_assets}>
          <TabContent tab={0}>
            <RangeChart
              onChange={onRange}
              data={portfolio.base.chart}
              range={portfolio.meta.range}
              ranges={portfolio.meta.validRanges}
              hidden={!portfolio.num_assets}
            />
          </TabContent>
          <TabContent tab={1}>
            <PortfolioDetails portfolio={portfolio} />
          </TabContent>
        </Tabs>

        <Stack gap={3}>
          {assets.map((asset) => (
            <AssetLink
              key={asset.id}
              asset={asset}
              onAddTx={handleAddTx(asset.id)}
              onMove={handleMoveAsset(asset.id)}
              onUpdate={handleUpdateAsset(asset.id)}
              onDelete={handleDeleteAsset(asset.id)}
            />
          ))}
        </Stack>
      </div>
    </>
  );
};

const DecoratedPortfolio = pipe(
  RawPortfolioDetails,
  withNoData<PortfolioProps, "portfolio">((p) => p.portfolio),
  withError,
  withFetching
);

export { DecoratedPortfolio as Portfolio };
