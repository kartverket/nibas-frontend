import React, { createContext, useCallback, useContext, useState } from "react";
import { KommuneRef } from "types/api";

type GrunnkretserPanel = {
  type: "grunnkrets";
  kommune: KommuneRef;
  isMinimized?: boolean;
};

type StemmekretserPanel = {
  type: "stemmekrets";
  kommune: KommuneRef;
  isMinimized?: boolean;
};

type KretserPanel = GrunnkretserPanel | StemmekretserPanel;
type Panel = GrunnkretserPanel | StemmekretserPanel;
export type PanelType = Panel["type"];

export type OverlayPanelsContextValue = {
  kretserContext: Panel | null;
  isOpen: (panel: PanelType) => boolean;
  openPanel: (panel: Panel) => void;
  closePanel: (panel: PanelType) => void;
  closePanels: () => void;
  toggleMinimizePanel: (panel: PanelType) => void;
};

/**
 * Bruk heller OverlayPanelsProvider i koden
 */
export const OverlayPanelsContext = createContext<
  OverlayPanelsContextValue | undefined
>(undefined);

export const OverlayPanelsProvider: React.FC = ({ children }) => {
  const [kretserContext, setKretserContext] = useState<KretserPanel | null>(
    null
  );

  const openPanel = useCallback((panel: Panel) => {
    if (panel.type === "grunnkrets" || panel.type === "stemmekrets") {
      setKretserContext(panel);
    }
  }, []);

  const closePanel = useCallback((panel: PanelType) => {
    if (panel === "grunnkrets" || panel === "stemmekrets") {
      setKretserContext(null);
    }
  }, []);

  const closePanels = useCallback(() => {
    setKretserContext(null);
  }, []);

  const isOpen = useCallback(
    (panel: PanelType) => {
      if (panel === "grunnkrets" || panel === "stemmekrets") {
        return kretserContext !== null;
      }
      return false;
    },
    [kretserContext]
  );

  const toggleMinimizePanel = useCallback((panel: PanelType) => {
    if (panel === "grunnkrets" || panel === "stemmekrets") {
      setKretserContext((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          isMinimized: !prev?.isMinimized,
        };
      });
    }
  }, []);

  const value = {
    kretserContext,
    openPanel,
    closePanel,
    isOpen,
    closePanels,
    toggleMinimizePanel,
  };

  return (
    <OverlayPanelsContext.Provider value={value}>
      {children}
    </OverlayPanelsContext.Provider>
  );
};

export const useOverlayPanels = () => {
  const context = useContext(OverlayPanelsContext);

  if (!context) {
    throw new Error(
      "useOverlayPanels must be used within a OverlayPanelsContext"
    );
  }

  return context;
};
