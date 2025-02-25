import { Coordinate } from "ol/coordinate";
import { createContext, ReactNode, useContext, useState } from "react";

type OverlayPopupContextValue = {
  openOverlayPopup: (popupContent: ReactNode, position: Coordinate) => void;
  closeOverlayPopup: () => void;
  overlayPopupContent: ReactNode;
  overlayPopupPosition: Coordinate | undefined;
};

const OverlayPopupContext = createContext<OverlayPopupContextValue | undefined>(undefined);

export const OverlayPopupProvider = ({ children }: { children: ReactNode }) => {
  const [overlayPopupPosition, setOverlayPopupPosition] = useState<Coordinate>();
  const [overlayPopupContent, setOverlayPopupContent] = useState<ReactNode>();
  const [, setIsOverlayPopupOpen] = useState(false);

  const openOverlayPopup = (popupContent: ReactNode, position: Coordinate) => {
    setOverlayPopupPosition(position);
    setOverlayPopupContent(popupContent);
    setIsOverlayPopupOpen(true);
  };
  const closeOverlayPopup = () => {
    setIsOverlayPopupOpen(false);
    setOverlayPopupContent(undefined);
    setOverlayPopupPosition(undefined);
  };

  const value = {
    openOverlayPopup,
    closeOverlayPopup,
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
