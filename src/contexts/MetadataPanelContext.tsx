import React, { createContext, useCallback, useContext, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";

type GrenseMetadataPanel = {
  content: "grensemetadata";
  data: Feature<Geometry>;
};

type Panel = GrenseMetadataPanel;

export type MetadataPanelContextValue = {
  panelContext: Panel | null;
  isOpen: boolean;
  openPanel: (newPanelContext: Panel) => void;
  closePanel: () => void;
};

/**
 * Bruk heller MetadataPanelProvider i koden
 */
const MetadataPanelContext = createContext<
  MetadataPanelContextValue | undefined
>(undefined);

export const MetadataPanelProvider: React.FC = ({ children }) => {
  const [panelContext, setPanelContext] = useState<Panel | null>(null);

  const openPanel = useCallback((newPanelContext: Panel) => {
    setPanelContext(newPanelContext);
  }, []);

  const closePanel = useCallback(() => {
    setPanelContext(null);
  }, []);

  const isOpen = !!panelContext;

  const value = { panelContext, openPanel, closePanel, isOpen };

  return (
    <MetadataPanelContext.Provider value={value}>
      {children}
    </MetadataPanelContext.Provider>
  );
};

export const useMetadataPanel = () => {
  const context = useContext(MetadataPanelContext);

  if (!context) {
    throw new Error(
      "useMetadataPanel must be used within a MetadataPanelContext"
    );
  }

  return context;
};
