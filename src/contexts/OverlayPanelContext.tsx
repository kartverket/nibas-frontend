import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, { createContext, useContext, useState } from "react";
import { KommuneRef } from "types/api";
import { useSidebarPanel } from "./SidebarPanelContext";

type OverlayPanel =
  | "metadata"
  | "grunnkrets"
  | "stemmekrets"
  | "sammenslåing"
  | "koordinater";
type SelectedFeature = Feature<LineString> | null;
type Flatedata = KommuneRef | null;
type PunktKoordinater = [number, number] | null;

export type OverlayPanelContextValue = {
  activeOverlayPanel: OverlayPanel | null;
  openOverlayPanel: (overlayPanel: OverlayPanel) => void;
  closeOverlayPanel: () => void;
  selectedFeature: SelectedFeature;
  setSelectedFeature: (selectedFeature: SelectedFeature) => void;
  flatedata: Flatedata;
  setFlatedata: (flatedata: Flatedata) => void;
  punktKoordinater: PunktKoordinater;
  setPunktKoordinater: (punktKoordinater: PunktKoordinater) => void;
};

export const OverlayPanelContext = createContext<
  OverlayPanelContextValue | undefined
>(undefined);

export const OverlayPanelProvider: React.FC = ({ children }) => {
  const { closeSidebarPanel } = useSidebarPanel();
  const [activeOverlayPanel, setActiveOverlayPanel] =
    useState<OverlayPanel | null>(null);

  const openOverlayPanel = (panelType: OverlayPanel) => {
    setActiveOverlayPanel(panelType);
    closeSidebarPanel();
  };

  const closeOverlayPanel = () => {
    setActiveOverlayPanel(null);
    setSelectedFeature(null);
  };

  // Brukes kun til MetadataPanel for å avgjøre hvilken feature man skal se data til
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

  // Brukes kun til paneler for stemmekrets og grunnkrets
  const [flatedata, setFlatedata] = useState<Flatedata>(null);

  // Brukes kun til panelet for punktkoordinater
  const [punktKoordinater, setPunktKoordinater] =
    useState<PunktKoordinater>(null);

  const value = {
    activeOverlayPanel,
    openOverlayPanel,
    closeOverlayPanel,
    selectedFeature,
    setSelectedFeature,
    flatedata,
    setFlatedata,
    punktKoordinater,
    setPunktKoordinater,
  };

  return (
    <OverlayPanelContext.Provider value={value}>
      {children}
    </OverlayPanelContext.Provider>
  );
};

export const useOverlayPanel = () => {
  const context = useContext(OverlayPanelContext);
  if (!context) {
    throw new Error(
      "useOverlayPanel must be used within a OverlayPanelContext"
    );
  }

  return context;
};
