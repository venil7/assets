import {
  defaultAsset,
  type EnrichedAsset,
  type EnrichedPortfolio,
  type PostAsset,
  type PostPortfolio,
  type PostTx,
} from "@darkruby/assets-core";
import type { ChartRange } from "@darkruby/assets-core/src/decoders/yahoo/meta";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Stack } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { AssetLink } from "../Asset/AssetLink";
import { assetModal } from "../Asset/AssetModal";
import { RangeChart } from "../Charts/RangesChart";
import { Info } from "../Form/Alert";
import { AddBtn } from "../Form/Button";
import { HorizontalStack } from "../Layout/Stack";
import { Totals } from "../Totals/Totals";
import { portfolioModal } from "./PortfolioModal";

type PortfolioDetailsProps = {
  portfolio: EnrichedPortfolio;
  assets: EnrichedAsset[];
  onUpdate: (p: PostPortfolio) => void;
  onAddAsset: (a: PostAsset) => void;
  onAddTx: (aid: number, a: PostTx) => void;
  onUpdateAsset: (aid: number, a: PostAsset) => void;
  onDeleteAsset: (aid: number) => void;
  onRange: (r: ChartRange) => void;
};

const RawPortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  portfolio,
  assets,
  onUpdate,
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset,
  onRange,
  onAddTx,
}: PortfolioDetailsProps) => {
  const handleAddAsset = () =>
    pipe(() => assetModal(defaultAsset()), TE.map(onAddAsset))();
  const handleUpdateAsset = (aid: number) => (a: PostAsset) =>
    onUpdateAsset(aid, a);
  const handleAddTx = (aid: number) => (t: PostTx) => onAddTx(aid, t);
  const handleDeleteAsset = (aid: number) => () => onDeleteAsset(aid);

  const handleUpdate = () =>
    pipe(() => portfolioModal(portfolio), TE.map(onUpdate));

  return (
    <>
      <div className="portfolio-details">
        <HorizontalStack className="top-toolbar">
          <AddBtn onClick={handleAddAsset} label="Asset" />
          <Totals
            change={portfolio.value}
            totals={portfolio.totals}
            range={portfolio.meta.range}
          />
        </HorizontalStack>
        <Info hidden={!!assets.length}>
          This portfolio doesn have any assets yet
        </Info>

        <RangeChart
          onChange={onRange}
          data={portfolio.chart}
          range={portfolio.meta.range}
          ranges={portfolio.meta.validRanges}
          hidden={!portfolio.num_assets}
        />

        <Stack gap={3}>
          {assets.map((asset) => (
            <AssetLink
              key={asset.id}
              asset={asset}
              onAddTx={handleAddTx(asset.id)}
              onUpdate={handleUpdateAsset(asset.id)}
              onDelete={handleDeleteAsset(asset.id)}
            />
          ))}
        </Stack>
      </div>
    </>
  );
};

const DecoratedPortfolioDetails = pipe(
  RawPortfolioDetails,
  withNoData<PortfolioDetailsProps, "portfolio">((p) => p.portfolio),
  withFetching,
  withError
);

export { DecoratedPortfolioDetails as PortfolioDetails };
