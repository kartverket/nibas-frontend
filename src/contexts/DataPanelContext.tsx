import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, { createContext, useContext, useState } from "react";

type ActiveDataPanel = "metadata" | "grunnkrets" | "stemmekrets" | null;
type SelectedMetadata = Feature<LineString> | null;

export type DataPanelContextValue = {
  activeDataPanel: ActiveDataPanel;
  setActiveDataPanel: (activeDataPanel: ActiveDataPanel) => void;
  selectedMetadata: SelectedMetadata;
  setSelectedMetadata: (selectedMetadata: SelectedMetadata) => void;
};

export const DataPanelContext = createContext<
  DataPanelContextValue | undefined
>(undefined);

export const DataPanelProvider: React.FC = ({ children }) => {
  const [activeDataPanel, setActiveDataPanel] =
    useState<ActiveDataPanel>("metadata");

  const [selectedMetadata, setSelectedMetadata] =
    useState<SelectedMetadata>(null);

  const value = {
    activeDataPanel,
    setActiveDataPanel,
    selectedMetadata,
    setSelectedMetadata,
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
