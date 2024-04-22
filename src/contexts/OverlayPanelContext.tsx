import React, { createContext, useContext, useState } from "react";
import { useFeatureStyle } from "./FeatureStyleContext/FeatureStyleContext";

type OverlayPanel = "grenseinfo" | "sammenslåing" | "splitting" | "tegnforklaring" | "koordinater" | "kartlag";

type OverlayModal =
  | "inndelinger"
  | "inndelinger-view"
  | "stemmekrets"
  | "grunnkrets"
  | "navigasjon"
  | "koordinatsystem";

export type OverlayPanelContextValue = {
  activeOverlayPanel: OverlayPanel | null;
  openOverlayPanel: (overlayPanel: OverlayPanel) => void;
  closeOverlayPanel: () => void;

  activeOverlayModal: OverlayModal | null;
  openOverlayModal: (overlayModal: OverlayModal) => void;
  closeOverlayModal: () => void;
};

export const OverlayPanelContext = createContext<OverlayPanelContextValue | undefined>(undefined);

export const OverlayPanelProvider = ({ children }: { children: React.ReactNode }) => {
  const { clearSelection } = useFeatureStyle();
  const [activeOverlayModal, setActiveOverlayModal] = useState<OverlayModal | null>(null);
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<OverlayPanel | null>(null);

  const openOverlayPanel = (panelType: OverlayPanel) => {
    setActiveOverlayPanel(panelType);
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

  const value = {
    activeOverlayPanel,
    activeOverlayModal,
    openOverlayPanel,
    openOverlayModal,
    closeOverlayPanel,
    closeOverlayModal,
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
