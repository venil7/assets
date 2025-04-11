import {
  defaultAsset,
  type EnrichedAsset,
  type EnrichedPortfolio,
  type PostAsset,
  type PostPortfolio,
  type PostTx,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Button, Stack, type ButtonProps } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { AssetLink } from "../Asset/AssetLink";
import { assetModal } from "../Asset/AssetModal";
import { Info } from "../Form/Alert";
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
};

const RawPortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  portfolio,
  assets,
  onUpdate,
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset,
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
          <AddBtn onClick={handleAddAsset} />
          <Totals value={portfolio.value.current} totals={portfolio.totals} />
        </HorizontalStack>
        <Info hidden={!!assets.length}>
          This portfolio doesn have any assets yet
        </Info>
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

const AddBtn = pipe(
  Button,
  withProps({
    size: "sm",
    variant: "outline-primary",
    children: "[+] Add Asset",
  })
) as React.FC<ButtonProps>;
