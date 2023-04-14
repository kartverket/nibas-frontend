import React, { createContext, useContext, useState } from "react";

type ActiveDataPanel = "metadata" | "grunnkrets" | "stemmekrets" | null;

export type DataPanelContextValue = {
  activeDataPanel: ActiveDataPanel;
  setActiveDataPanel: (activeDataPanel: ActiveDataPanel) => void;
};

export const DataPanelContext = createContext<
  DataPanelContextValue | undefined
>(undefined);

export const DataPanelProvider: React.FC = ({ children }) => {
  const [activeDataPanel, setActiveDataPanel] =
    useState<ActiveDataPanel>("metadata");

  const value = {
    activeDataPanel,
    setActiveDataPanel,
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
