import React, { createContext, useContext, useState } from "react";
import { KommuneRef } from "types/api";
import { useSidebarPanel } from "./SidebarPanelContext";
import { useFeatureStyle } from "./FeatureStyleContext";

type OverlayPanel = "metadata" | "sammenslåing" | "splitting" | "tegnforklaring" | "koordinater" | "kartlag";

type OverlayModal = "stemmekrets" | "grunnkrets";
type Flatedata = KommuneRef | null;

export type OverlayPanelContextValue = {
  activeOverlayPanel: OverlayPanel | null;
  openOverlayPanel: (overlayPanel: OverlayPanel) => void;
  closeOverlayPanel: () => void;

  activeOverlayModal: OverlayModal | null;
  openOverlayModal: (overlayModal: OverlayModal) => void;
  closeOverlayModal: () => void;

  flatedata: Flatedata;
  setFlatedata: (flatedata: Flatedata) => void;
};

export const OverlayPanelContext = createContext<OverlayPanelContextValue | undefined>(undefined);

export const OverlayPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const { closeSidebarPanel } = useSidebarPanel();
  const { clearSelection } = useFeatureStyle();
  const [activeOverlayModal, setActiveOverlayModal] = useState<OverlayModal | null>(null);
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<OverlayPanel | null>(null);

  const openOverlayPanel = (panelType: OverlayPanel) => {
    setActiveOverlayPanel(panelType);
    closeSidebarPanel();
  };

  const openOverlayModal = (modalType: OverlayModal) => {
    setActiveOverlayModal(modalType);
  };

  const closeOverlayModal = () => {
    setActiveOverlayModal(null);
  };

  const closeOverlayPanel = () => {
    setActiveOverlayPanel(null);
    clearSelection();
  };

  // Brukes kun til paneler for stemmekrets og grunnkrets
  const [flatedata, setFlatedata] = useState<Flatedata>(null);

  const value = {
    activeOverlayPanel,
    activeOverlayModal,
    openOverlayPanel,
    openOverlayModal,
    closeOverlayPanel,
    closeOverlayModal,
    flatedata,
    setFlatedata,
  };

  return <OverlayPanelContext.Provider value={value}>{children}</OverlayPanelContext.Provider>;
};

export const useOverlayPanel = () => {
  const context = useContext(OverlayPanelContext);
  if (!context) {
    throw new Error("useOverlayPanel must be used within a OverlayPanelContext");
  }

  return context;
};
