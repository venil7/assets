import type { GetAsset, GetPortfolio, Nullable } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Link } from "react-router";
import { withVisibility } from "../../decorators/nodata";
import { routes } from "../Router";

type NavCrumbProps = {
  portfolio?: Nullable<GetPortfolio>;
  asset?: Nullable<GetAsset>;
};

const NavCrumbItem = pipe(Breadcrumb.Item, withVisibility());

export const NavCrumb: React.FC<NavCrumbProps> = ({ portfolio, asset }) => {
  return (
    <Breadcrumb>
      <NavCrumbItem
        linkAs={({ children }) => (
          <Link to={routes.portfolios()}>{children}</Link>
        )}
      >
        Home
      </NavCrumbItem>
      <NavCrumbItem
        hidden={!portfolio}
        linkAs={({ children }) => (
          <Link to={routes.portfolio(portfolio?.id!)}>{children}</Link>
        )}
      >
        {portfolio?.name}
      </NavCrumbItem>
      <NavCrumbItem hidden={!asset}>{asset?.name}</NavCrumbItem>
    </Breadcrumb>
  );
};
