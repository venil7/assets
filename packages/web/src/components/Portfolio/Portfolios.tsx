import {
  defaultPortfolio,
  type EnrichedPortfolio,
  type PostPortfolio,
} from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Button, Stack, type ButtonProps } from "react-bootstrap";
import { withError } from "../../decorators/errors";
import { withFetching } from "../../decorators/fetching";
import { withNoData } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";
import { HorizontalStack } from "../Layout/Stack";
import { PortfolioLink } from "./PortfolioLink";
import { portfolioModal } from "./PortfolioModal";

type PortfoliosProps = {
  portfolios: EnrichedPortfolio[];
  onAdd: (p: PostPortfolio) => void;
  onUpdate: (pid: number, p: PostPortfolio) => void;
  onDelete: (pid: number) => void;
};

const RawPortfolios: React.FC<PortfoliosProps> = ({
  portfolios,
  onAdd,
  onUpdate,
  onDelete,
}: PortfoliosProps) => {
  const handleAdd = () =>
    pipe(() => portfolioModal(defaultPortfolio()), TE.map(onAdd))();
  const handleUpdate = (pid: number) => (p: PostPortfolio) => onUpdate(pid, p);
  const handleDelete = (pid: number) => () => onDelete(pid);

  return (
    <div className="portfolios">
      <HorizontalStack className="top-toolbar">
        <AddBtn onClick={handleAdd} />
      </HorizontalStack>
      <Stack gap={3}>
        {portfolios.map((port) => (
          <PortfolioLink
            key={port.id}
            portfolio={port}
            onUpdate={handleUpdate(port.id)}
            onDelete={handleDelete(port.id)}
          />
        ))}
      </Stack>
    </div>
  );
};

export const Portfolios = pipe(
  RawPortfolios,
  withNoData<PortfoliosProps, "portfolios">((p) => p.portfolios?.length),
  withFetching,
  withError
);

const AddBtn = pipe(
  Button,
  withProps({
    size: "sm",
    variant: "outline-primary",
    children: "[+] Add Portfolio",
  })
) as React.FC<ButtonProps>;
