import { pipe } from "fp-ts/lib/function";
import { Stack } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import type { PortfolioDetails } from "../../domain/portfolioDetails";
import { AssetLink } from "../Asset/AssetLink";

type PortfolioDetailsProps = {
  details: PortfolioDetails;
};

const RawPortfolioDetails: React.FC<PortfolioDetailsProps> = ({
  details,
}: PortfolioDetailsProps) => {
  return (
    <>
      <h3>{details.name}</h3>
      <Stack gap={3}>
        {details.assets.map((asset) => (
          <AssetLink key={asset.id} asset={asset} />
        ))}
      </Stack>
    </>
  );
};

const DecoratedPortfolioDetails = pipe(
  RawPortfolioDetails,
  withNoData<PortfolioDetailsProps, "details">((p) => p.details),
  withFetching,
  withError
);

export { DecoratedPortfolioDetails as PortfolioDetails };
