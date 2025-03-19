import Overlay from "ol/Overlay";
import { Coordinate } from "ol/coordinate";
import { createContext, ReactNode, useContext, useState } from "react";

type OverlayPopupContextValue = {
  openOverlayPopup: (popupContent: ReactNode, position: Coordinate) => void;
  closeOverlayPopup: () => void;
  overlayPopup: Overlay;
  overlayPopupContent: ReactNode;
  overlayPopupPosition: Coordinate | undefined;
};

const overlayPopup = new Overlay({
  autoPan: {
    animation: {
      duration: 250,
    },
  },
  positioning: "center-center",
  offset: [0, 0],
});

const OverlayPopupContext = createContext<OverlayPopupContextValue | undefined>(undefined);

export const OverlayPopupProvider = ({ children }: { children: ReactNode }) => {
  const [overlayPopupPosition, setOverlayPopupPosition] = useState<Coordinate>();
  const [overlayPopupContent, setOverlayPopupContent] = useState<ReactNode>();
  const [timeout, timoutSet] = useState<NodeJS.Timeout>();

  const openOverlayPopup = (popupContent: ReactNode, position: Coordinate) => {
    clearTimeout(timeout);
    timoutSet(setTimeout(closeOverlayPopup, 2000));
    setOverlayPopupPosition(position);
    setOverlayPopupContent(popupContent);
  };
  const closeOverlayPopup = () => {
    setOverlayPopupContent(undefined);
    setOverlayPopupPosition(undefined);
  };

  const value = {
    openOverlayPopup,
    closeOverlayPopup,
    overlayPopup,
    overlayPopupContent,
    overlayPopupPosition,
  };

  return <OverlayPopupContext.Provider value={value}>{children}</OverlayPopupContext.Provider>;
};

export const useOverlayPopup = () => {
  const context = useContext(OverlayPopupContext);
  if (!context) {
    throw new Error("useOverlayPopup must be used within an OverlayPanelContext");
  }
  return context;
};
