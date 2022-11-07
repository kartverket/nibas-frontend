import React, { createContext, useCallback, useContext, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { KommuneRef } from "types/api";

type GrenseMetadataPanel = {
  type: "grensemetadata";
  feature: Feature<Geometry>;
};

type GrunnkretserPanel = {
  type: "grunnkrets";
  kommune: KommuneRef;
};

type StemmekretserPanel = {
  type: "stemmekrets";
  kommune: KommuneRef;
};

type KretserPanel = GrunnkretserPanel | StemmekretserPanel;
type Panel = GrenseMetadataPanel | GrunnkretserPanel | StemmekretserPanel;
export type PanelType = Panel["type"];

export type MetadataPanelContextValue = {
  panelContext: Panel | null;
  kretserContext: Panel | null;
  isOpen: (panel: PanelType) => boolean;
  openPanel: (panel: Panel) => void;
  closePanel: (panel: PanelType) => void;
  closePanels: () => void;
};

/**
 * Bruk heller MetadataPanelProvider i koden
 */
export const MetadataPanelContext = createContext<
  MetadataPanelContextValue | undefined
>(undefined);

export const MetadataPanelProvider: React.FC = ({ children }) => {
  const [panelContext, setPanelContext] = useState<GrenseMetadataPanel | null>(
    null
  );
  const [kretserContext, setKretserContext] = useState<KretserPanel | null>(
    null
  );

  const openPanel = useCallback((panel: Panel) => {
    if (panel.type === "grunnkrets" || panel.type === "stemmekrets") {
      setKretserContext(panel);
    } else {
      setPanelContext(panel);
    }
  }, []);

  const closePanel = useCallback((panel: PanelType) => {
    if (panel === "grunnkrets" || panel === "stemmekrets") {
      setKretserContext(null);
    } else {
      setPanelContext(null);
    }
  }, []);

  const closePanels = useCallback(() => {
    setPanelContext(null);
    setKretserContext(null);
  }, []);

  const isOpen = (panel: PanelType) => {
    if (panel === "grunnkrets" || panel === "stemmekrets") {
      return kretserContext !== null;
    } else {
      return panelContext !== null;
    }
  };

  const value = {
    panelContext,
    kretserContext,
    openPanel,
    closePanel,
    isOpen,
    closePanels,
  };

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
