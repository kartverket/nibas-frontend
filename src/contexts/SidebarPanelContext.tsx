import React, { createContext, useContext, useState } from "react";

export type SidebarPanel = "inndelinger" | "kartlag" | "utkast" | null;

export type SidebarPanelContextValue = {
  activeSidebarPanel: SidebarPanel;
  setActiveSidebarPanel: (panel: SidebarPanel) => void;
  closeSidebar: () => void;
};

/**
 * Bruk heller SidebarPanelProvider i koden
 */
export const SidebarPanelContext = createContext<
  SidebarPanelContextValue | undefined
>(undefined);

export const SidebarPanelProvider: React.FC = ({ children }) => {
  const [activeSidebarPanel, setActiveSidebarPanel] =
    useState<SidebarPanel>(null);

  const closeSidebar = () => {
    setActiveSidebarPanel(null);
  };

  const value = { activeSidebarPanel, setActiveSidebarPanel, closeSidebar };

  return (
    <SidebarPanelContext.Provider value={value}>
      {children}
    </SidebarPanelContext.Provider>
  );
};

export const useSidebarPanel = () => {
  const context = useContext(SidebarPanelContext);
  if (!context) {
    throw new Error(
      "useSidebarPanel must be used within a SidebarPanelContext"
    );
  }
  return context;
};
