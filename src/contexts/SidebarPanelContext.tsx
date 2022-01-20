import React, { createContext, useContext, useState } from "react";

export type SidebarPanel = "nibas" | "search" | "backgroundLayers" | "drafts";
export type OpenSidebarPanels = Record<SidebarPanel, boolean>;

const getClosedPanels = () =>
  ({
    nibas: false,
    search: false,
    backgroundLayers: false,
    drafts: false,
  } as OpenSidebarPanels);

const SidebarPanelContext = createContext<
  | {
      openPanels: OpenSidebarPanels;
      setPanel: (panel: SidebarPanel, value: boolean) => void;
      togglePanel: (panel: SidebarPanel) => void;
    }
  | undefined
>(undefined);

export const SidebarPanelProvider: React.FC = ({ children }) => {
  const [openPanels, setOpenPanels] = useState(getClosedPanels());

  const setPanel = (panel: SidebarPanel, value: boolean) => {
    const newPanels = {
      ...getClosedPanels(),
      [panel]: value,
    };

    setOpenPanels(newPanels);
  };

  const togglePanel = (panel: SidebarPanel) =>
    setPanel(panel, !openPanels[panel]);

  const value = { openPanels, setPanel, togglePanel };

  return (
    <SidebarPanelContext.Provider value={value}>
      {children}
    </SidebarPanelContext.Provider>
  );
};

export const useSidebarPanels = () => {
  const context = useContext(SidebarPanelContext);

  if (!context) {
    throw new Error(
      "useSidebarPanels must be used within a SidebarPanelProvider"
    );
  }

  return context;
};

export const useSidebarPanel = (panel: SidebarPanel) => {
  const { openPanels, setPanel, togglePanel } = useSidebarPanels();

  return {
    isOpen: openPanels[panel],
    setPanel: (value: boolean) => setPanel(panel, value),
    togglePanel: () => togglePanel(panel),
  };
};
