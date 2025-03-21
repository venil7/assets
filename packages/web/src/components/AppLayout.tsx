import type { PropsWithChildren } from "react";

export const AppLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="container">{children}</div>;
};
