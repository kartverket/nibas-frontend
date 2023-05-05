import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, { createContext, useContext, useState } from "react";
import { KommuneRef } from "types/api";

type ActiveDataPanel = "metadata" | "grunnkrets" | "stemmekrets" | null;
type SelectedFeature = Feature<LineString> | null;
type Flatedata = KommuneRef | null;

export type DataPanelContextValue = {
  activeDataPanel: ActiveDataPanel;
  setActiveDataPanel: (activeDataPanel: ActiveDataPanel) => void;
  selectedFeature: SelectedFeature;
  setSelectedFeature: (selectedFeature: SelectedFeature) => void;
  flatedata: Flatedata;
  setFlatedata: (flatedata: Flatedata) => void;
};

export const DataPanelContext = createContext<
  DataPanelContextValue | undefined
>(undefined);

// TODO: rename til OverlayPanelsProvider (eventuelt entall)
export const DataPanelProvider: React.FC = ({ children }) => {
  const [activeDataPanel, setActiveDataPanel] = useState<ActiveDataPanel>(null);

  // Brukes kun til metadatapanel for å avgjøre hvilken feature man skal se data til
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

  // Brukes kun til paneler for stemmekrets og grunnkrets
  const [flatedata, setFlatedata] = useState<Flatedata>(null);

  const value = {
    activeDataPanel,
    setActiveDataPanel,
    selectedFeature,
    setSelectedFeature,
    flatedata,
    setFlatedata,
  };

  return (
    <DataPanelContext.Provider value={value}>
      {children}
    </DataPanelContext.Provider>
  );
};

export const useDataPanel = () => {
  const context = useContext(DataPanelContext);
  if (!context) {
    throw new Error("useDataPanel must be used within a DataPanelContext");
  }

  return context;
};
