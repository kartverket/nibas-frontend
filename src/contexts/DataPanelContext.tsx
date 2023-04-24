import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, { createContext, useContext, useState } from "react";

type ActiveDataPanel = "metadata" | "grunnkrets" | "stemmekrets" | null;
type SelectedFeature = Feature<LineString> | null;

export type DataPanelContextValue = {
  activeDataPanel: ActiveDataPanel;
  setActiveDataPanel: (activeDataPanel: ActiveDataPanel) => void;
  selectedFeature: SelectedFeature;
  setSelectedFeature: (selectedFeature: SelectedFeature) => void;
};

export const DataPanelContext = createContext<
  DataPanelContextValue | undefined
>(undefined);

export const DataPanelProvider: React.FC = ({ children }) => {
  const [activeDataPanel, setActiveDataPanel] = useState<ActiveDataPanel>(null);
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

  const value = {
    activeDataPanel,
    setActiveDataPanel,
    selectedFeature,
    setSelectedFeature,
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
