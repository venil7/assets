import {
  defaultAsset,
  type PostAsset,
  type PostPortfolio,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Button, Stack, type ButtonProps } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import type { PortfolioDetails } from "../../domain/portfolioDetails";
import { AssetLink } from "../Asset/AssetLink";
import { assetModal } from "../Asset/AssetModal";
import { Info } from "../Form/Alert";
import { HorizontalStack } from "../Layout/Stack";
import { portfolioModal } from "./PortfolioModal";

type PortfolioDetailsProps = {
  details: PortfolioDetails;
  onUpdate: (p: PostPortfolio) => void;

  onAddAsset: (a: PostAsset) => void;
  onUpdateAsset: (aid: number, a: PostAsset) => void;
  onDeleteAsset: (aid: number) => void;
};

const RawPortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  details,
  onUpdate,
  onAddAsset,
  onDeleteAsset,
  onUpdateAsset,
}: PortfolioDetailsProps) => {
  const handleAddAsset = () =>
    pipe(() => assetModal(defaultAsset()), TE.map(onAddAsset))();
  const handleUpdateAsset = (aid: number) => (a: PostAsset) =>
    onUpdateAsset(aid, a);
  const handleDeleteAsset = (aid: number) => () => onDeleteAsset(aid);

  const handleUpdate = () =>
    pipe(() => portfolioModal(details), TE.map(onUpdate));

  return (
    <div className="portfolio-details">
      <HorizontalStack className="top-toolbar">
        <h3 className="start">{details.name}</h3>
        <AddBtn onClick={handleAddAsset} />
      </HorizontalStack>
      <Info hidden={!!details.assets.length}>
        This portfolio doesn have any assets yet
      </Info>
      <Stack gap={3}>
        {details.assets.map((asset) => (
          <AssetLink
            key={asset.id}
            asset={asset}
            onUpdate={handleUpdateAsset(asset.id)}
            onDelete={handleDeleteAsset(asset.id)}
          />
        ))}
      </Stack>
    </div>
  );
};

const DecoratedPortfolioDetails = pipe(
  RawPortfolioDetails,
  withNoData<PortfolioDetailsProps, "details">((p) => p.details),
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
