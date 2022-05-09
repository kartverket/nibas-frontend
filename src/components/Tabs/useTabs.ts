import { useState } from "react";

export type TabDictionary<Tab extends string> = {
  [Property in Tab]: Property;
};

const useTabs = <T extends string>(tabs: T[]) => {
  const [selectedTab, setSelectedTab] = useState<T>(tabs[0]);

  const openTab = (tab: T) => setSelectedTab(tab);

  const ids = tabs.reduce(
    (acc, id) => ({
      ...acc,
      [id]: id,
    }),
    {} as TabDictionary<T>
  );

  return {
    selectedTab,
    openTab,
    ids,
  };
};

export default useTabs;
