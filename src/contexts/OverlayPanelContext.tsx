import React, { createContext, useContext, useState } from "react";
import { useFeatureStyle } from "./FeatureStyleContext/FeatureStyleContext";
const overlayPanelValues = [
  "grenseinfo",
  "sammenslåing",
  "splitting",
  "tegnforklaring",
  "koordinater",
  "kartlag",
] as const;
export type OverlayPanel = (typeof overlayPanelValues)[number];
const overlayModalValues = ["inndelinger", "inndelinger-view", "flatedata", "navigasjon"] as const;
export type OverlayModal = (typeof overlayModalValues)[number];

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isOverlayPanel = (value: any): value is OverlayPanel => {
  const allowedValues: OverlayPanel[] = overlayPanelValues.slice();

  return allowedValues.includes(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isOverlayModal = (value: any): value is OverlayModal => {
  const allowedValues: OverlayModal[] = overlayModalValues.slice();

  return allowedValues.includes(value);
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
