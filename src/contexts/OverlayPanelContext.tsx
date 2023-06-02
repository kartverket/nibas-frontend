import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, { createContext, useContext, useState } from "react";
import { KommuneRef } from "types/api";
import { useSidebarPanel } from "./SidebarPanelContext";
import Geometry from "ol/geom/Geometry";

type OverlayPanel =
  | "metadata"
  | "grunnkrets"
  | "stemmekrets"
  | "sammenslåing"
  | "koordinater";
type SelectedFeature = Feature<LineString> | null;
type Flatedata = KommuneRef | null;
export type SelectedPoint = {
  coordinates: [number, number];
  features: Feature<Geometry>[];
} | null;

export type OverlayPanelContextValue = {
  activeOverlayPanel: OverlayPanel | null;
  openOverlayPanel: (overlayPanel: OverlayPanel) => void;
  closeOverlayPanel: () => void;
  selectedFeature: SelectedFeature;
  setSelectedFeature: (selectedFeature: SelectedFeature) => void;
  selectedPoint: SelectedPoint;
  setSelectedPoint: (selectedPoint: SelectedPoint) => void;
  flatedata: Flatedata;
  setFlatedata: (flatedata: Flatedata) => void;
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

  // Brukes til MetadataPanel for å avgjøre hvilken feature man skal se data til
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

  // Brukes til KoordinaterPanel for å huske valgt punkt og hvilke features det tilhører
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint>(null);

  // Brukes kun til paneler for stemmekrets og grunnkrets
  const [flatedata, setFlatedata] = useState<Flatedata>(null);

  const value = {
    activeOverlayPanel,
    openOverlayPanel,
    closeOverlayPanel,
    selectedFeature,
    setSelectedFeature,
    flatedata,
    setFlatedata,
    selectedPoint,
    setSelectedPoint,
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
