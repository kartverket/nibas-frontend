import React from "react";

type Props<T> = {
  value: T;
  selectedTab: T;
  children: React.ReactNode;
};

const Tab = <T extends string>({ value, selectedTab, children }: Props<T>) => {
  if (selectedTab !== value) return null;

  return <div>{children}</div>;
};

export default Tab;
