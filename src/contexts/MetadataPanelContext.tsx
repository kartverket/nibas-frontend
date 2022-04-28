import React, { createContext, useCallback, useContext, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";

type GrenseMetadataPanel = {
  content: "grensemetadata";
  data: Feature<Geometry>;
};

type Panel = GrenseMetadataPanel;

const MetadataPanelContext = createContext<
  | {
      panelContext: Panel | null;
      openPanel: (newPanelContext: Panel) => void;
      closePanel: () => void;
    }
  | undefined
>(undefined);

export const MetadataPanelProvider: React.FC = ({ children }) => {
  const [panelContext, setPanelContext] = useState<Panel | null>(null);

  const openPanel = useCallback((newPanelContext: Panel) => {
    setPanelContext(newPanelContext);
  }, []);

  const closePanel = useCallback(() => {
    setPanelContext(null);
  }, []);

  const value = { panelContext, openPanel, closePanel };

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
