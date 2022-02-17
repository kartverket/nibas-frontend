import React from "react";
import { TabDictionary } from "./useTabs";
import Button from "components/Button";

type TabsProps<T extends string> = {
  children: React.ReactNode;
  tabs: TabDictionary<T>;
  openTab: (tab: T) => void;
};

const Tabs = <T extends string>({ children, tabs, openTab }: TabsProps<T>) => {
  return (
    <div>
      {Object.keys(tabs).map((tabId) => (
        <Button key={tabId} onClick={() => openTab(tabId as T)}>
          {tabId}
        </Button>
      ))}
      {children}
    </div>
  );
};

type TabProps<T> = {
  value: T;
  selectedTab: T;
  children: React.ReactNode;
};

export const Tab = <T extends string>({
  value,
  selectedTab,
  children,
}: TabProps<T>) => {
  if (selectedTab !== value) return null;

  return <div>{children}</div>;
};

export default Tabs;
