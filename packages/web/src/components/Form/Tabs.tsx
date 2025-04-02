import { pipe } from "fp-ts/lib/function";
import { useState, type PropsWithChildren } from "react";
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane as TabPaneRaw,
  type TabPaneProps,
} from "react-bootstrap";
import { withVisibility } from "../../decorators/nodata";

export type TabsProps = PropsWithChildren<{
  tabs: string[];
}>;

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Nav /*tabs*/>
        {tabs.map((name, idx) => (
          <NavItem key={`${name}-${idx}`}>
            <NavLink
              // className={classNames({ active: idx === tab })}
              onClick={() => setTab(idx)}
            >
              {name}{" "}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent /*act={tab}*/>{children}</TabContent>
    </>
  );
};

export const TabPane = pipe(
  TabPaneRaw as unknown as React.FC<TabPaneProps>,
  withVisibility
);
