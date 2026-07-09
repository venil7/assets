import type { Optional } from "@darkruby/assets-core";
import { pipe, type Lazy } from "fp-ts/lib/function";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { Nav } from "react-bootstrap";
import { withVisibility } from "../../decorators/nodata";

export type TabsProps = PropsWithChildren<{
  tabs: readonly string[];
  onTabChange?: (idx: number) => void;
  init?: number;
  hidden?: boolean;
}>;

const TabContext = createContext({ tab: 0 });

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  hidden,
  onTabChange,
  init = 0,
  children
}) => {
  const [tab, setTab] = useState(init >= 0 && init < tabs.length ? init : 0);
  const lastCallbackTabRef = useRef<Optional<number>>(undefined);

  const handleTabClick = (idx: number) => () => {
    setTab(idx);
  };

  useEffect(() => {
    if (lastCallbackTabRef.current !== tab) {
      lastCallbackTabRef.current = tab;
      onTabChange?.(tab);
    }
  }, [tab, onTabChange]);

  return (
    <>
      <Nav
        variant="tabs"
        activeKey={tab}
        defaultActiveKey={tab}
        hidden={hidden}
      >
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
  children
}) => {
  const Div: React.FC<PropsWithChildren> = (p) => (
    <div className="tab-pane mt-3 mb-3">{p.children}</div>
  );
  const TabDiv = pipe(Div, withVisibility());
  const { tab: selectedTab } = useContext(TabContext);
  return <TabDiv hidden={selectedTab !== tab}>{children}</TabDiv>;
};

export const generateTabId = (): Lazy<number> => {
  let counter = -1;
  return () => ++counter;
};
