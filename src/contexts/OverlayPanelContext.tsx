import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, { createContext, useContext, useState } from "react";
import { KommuneRef } from "types/api";

type ActiveOverlayPanel = "metadata" | "grunnkrets" | "stemmekrets" | null;
type SelectedFeature = Feature<LineString> | null;
type Flatedata = KommuneRef | null;

export type OverlayPanelContextValue = {
  activeOverlayPanel: ActiveOverlayPanel;
  setActiveOverlayPanel: (activeOverlayPanel: ActiveOverlayPanel) => void;
  closeOverlay: () => void;
  selectedFeature: SelectedFeature;
  setSelectedFeature: (selectedFeature: SelectedFeature) => void;
  flatedata: Flatedata;
  setFlatedata: (flatedata: Flatedata) => void;
};

export const OverlayPanelContext = createContext<
  OverlayPanelContextValue | undefined
>(undefined);

export const OverlayPanelProvider: React.FC = ({ children }) => {
  const [activeOverlayPanel, setActiveOverlayPanel] =
    useState<ActiveOverlayPanel>(null);

  const closeOverlay = () => {
    setActiveOverlayPanel(null);
    setSelectedFeature(null);
  };

  // Brukes kun til MetadataPanel for å avgjøre hvilken feature man skal se data til
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

  // Brukes kun til paneler for stemmekrets og grunnkrets
  const [flatedata, setFlatedata] = useState<Flatedata>(null);

  const value = {
    activeOverlayPanel,
    setActiveOverlayPanel,
    closeOverlay,
    selectedFeature,
    setSelectedFeature,
    flatedata,
    setFlatedata,
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
