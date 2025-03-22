import type { GetPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { Stack } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { PortfolioLink } from "./PortfolioLink";

type PortfoliosProps = {
  portfolios: GetPortfolio[];
};

const RawPortfolios: React.FC<PortfoliosProps> = ({
  portfolios,
}: PortfoliosProps) => {
  return (
    <Stack gap={3}>
      {portfolios.map((port) => (
        <PortfolioLink key={port.id} portfolio={port} />
      ))}
    </Stack>
  );
};

export const Portfolios = pipe(
  RawPortfolios,
  withNoData<PortfoliosProps, "portfolios">((p) => p.portfolios?.length),
  withFetching,
  withError
);
