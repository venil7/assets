import { pipe } from "fp-ts/lib/function";
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { Nav } from "react-bootstrap";
import { withVisibility } from "../../decorators/nodata";

export type TabsProps = PropsWithChildren<{
  tabs: readonly string[];
}>;

const TabContext = createContext({ tab: 0 });

export const Tabs: React.FC<TabsProps> = ({ tabs, children }) => {
  const [tab, setTab] = useState(0);
  const handleTabClick = (idx: number) => () => setTab(idx);
  return (
    <>
      <Nav variant="tabs" activeKey={tab} defaultActiveKey={tab}>
        {tabs.map((name, idx) => (
          <Nav.Item key={`${name}-${idx}`}>
            <Nav.Link eventKey={idx} onClick={handleTabClick(idx)}>
              {name}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
      <TabContext.Provider value={{ tab }}>{children}</TabContext.Provider>
    </>
  );
};

export const TabContent: React.FC<PropsWithChildren & { tab: number }> = ({
  tab,
  children,
}) => {
  const Div: React.FC<PropsWithChildren> = (p) => (
    <div className="tab-pane mt-3 mb-3">{p.children}</div>
  );
  const TabDiv = pipe(Div, withVisibility());
  const { tab: selectedTab } = useContext(TabContext);
  return <TabDiv hidden={selectedTab !== tab}>{children}</TabDiv>;
};
