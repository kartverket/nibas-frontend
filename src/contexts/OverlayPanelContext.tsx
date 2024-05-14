import React, { createContext, useContext, useState } from "react";
import { useFeatureStyle } from "./FeatureStyleContext/FeatureStyleContext";

type OverlayPanel = "grenseinfo" | "sammenslåing" | "splitting" | "tegnforklaring" | "koordinater" | "kartlag";
type OverlayModal = "inndelinger" | "inndelinger-view" | "flatedata" | "navigasjon";

export type OverlayPanelContextValue = {
  activeOverlayPanel: OverlayPanel | null;
  openOverlayPanel: (overlayPanel: OverlayPanel) => void;
  closeOverlayPanel: () => void;
  toggleOverlayPanel: (overlayPanel: OverlayPanel) => void;

  activeOverlayModal: OverlayModal | null;
  openOverlayModal: (overlayModal: OverlayModal) => void;
  closeOverlayModal: () => void;
  toggleOverlayModal: (overlayModal: OverlayModal) => void;
};

export const OverlayPanelContext = createContext<OverlayPanelContextValue | undefined>(undefined);

export const OverlayPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const { clearSelection } = useFeatureStyle();
  const [activeOverlayModal, setActiveOverlayModal] = useState<OverlayModal | null>(null);
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<OverlayPanel | null>(null);

  const openOverlayModal = (modalType: OverlayModal) => setActiveOverlayModal(modalType);
  const openOverlayPanel = (panelType: OverlayPanel) => setActiveOverlayPanel(panelType);
  const closeOverlayModal = () => setActiveOverlayModal(null);
  const closeOverlayPanel = () => {
    setActiveOverlayPanel(null);
    clearSelection();
  };

  const toggleOverlayModal = (modalType: OverlayModal) =>
    modalType === activeOverlayModal ? closeOverlayModal() : openOverlayModal(modalType);

  const toggleOverlayPanel = (panelType: OverlayPanel) =>
    panelType === activeOverlayPanel ? closeOverlayPanel() : openOverlayPanel(panelType);

  const value = {
    activeOverlayModal,
    activeOverlayPanel,
    openOverlayModal,
    openOverlayPanel,
    closeOverlayModal,
    closeOverlayPanel,
    toggleOverlayModal,
    toggleOverlayPanel,
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
