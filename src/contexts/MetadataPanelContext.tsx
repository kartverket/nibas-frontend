import React, { createContext, useCallback, useContext, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";

type PanelContent = "grensemetadata";

type PanelContext = {
  grensemetadata: Feature<Geometry>;
};

const MetadataPanelContext = createContext<
  | {
      panelContent: PanelContent | null;
      panelData: any | null;
      openPanel: (content: PanelContent, data: any) => void;
      closePanel: () => void;
    }
  | undefined
>(undefined);

export const MetadataPanelProvider: React.FC = ({ children }) => {
  const [panelContent, setPanelContent] = useState<PanelContent | null>(null);
  const [panelData, setPanelData] = useState<any | null>(null);

  const openPanel = useCallback((content: PanelContent, data: any) => {
    setPanelContent(content);
    setPanelData(data);
  }, []);

  const closePanel = useCallback(() => {
    setPanelContent(null);
    setPanelData(null);
  }, []);

  const value = { panelContent, panelData, openPanel, closePanel };

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
