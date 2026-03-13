import * as React from "react";

type BasicListProps<T extends string | number | boolean = string> = {
  items: T[];
  separator?: string;
  tag?: keyof React.JSX.IntrinsicElements;
};

export const BasicList: React.FC<BasicListProps> = ({
  items,
  tag = "span",
  separator = ","
}) => {
  const Tag = tag as keyof React.JSX.IntrinsicElements;
  return <Tag>{items.join(separator)}</Tag>;
};
