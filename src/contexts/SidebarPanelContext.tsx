import React, { createContext, useContext, useState } from "react";

type SidebarPanel = "inndelinger";

export type SidebarPanelContextValue = {
  activeSidebarPanel: SidebarPanel | null;
  openSidebarPanel: (panel: SidebarPanel) => void;
  closeSidebarPanel: () => void;
};

export const SidebarPanelContext = createContext<SidebarPanelContextValue | undefined>(undefined);

export const SidebarPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel | null>(null);

  const openSidebarPanel = (sidebarPanel: SidebarPanel) => {
    setActiveSidebarPanel(sidebarPanel);
  };

  const closeSidebarPanel = () => {
    setActiveSidebarPanel(null);
  };

  const value = {
    activeSidebarPanel,
    openSidebarPanel,
    closeSidebarPanel,
  };

  return <SidebarPanelContext.Provider value={value}>{children}</SidebarPanelContext.Provider>;
};

export const useSidebarPanel = () => {
  const context = useContext(SidebarPanelContext);
  if (!context) {
    throw new Error("useSidebarPanel must be used within a SidebarPanelContext");
  }
  return context;
};
