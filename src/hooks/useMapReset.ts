import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { resetMapView } from "utils/map/map-utils";

const useMapReset = () => {
  const { resetKartlag } = useKartlag();
  const { resetTool, resetModeTools } = useToolbar();
  const { activeOverlayPanel, closeOverlayPanel, activeOverlayModal, closeOverlayModal } = useOverlayPanel();
  const { getAllInndelinger, clearInndelingerAndSources } = useInndelinger();

  const resetMap = () => {
    resetMapView();
    resetTool();
    resetModeTools();
    resetKartlag();

    // Disse krever ekstra sjekking for å unngå uendelig useEffekt-løkke
    if (activeOverlayPanel) closeOverlayPanel();
    if (activeOverlayModal) closeOverlayModal();
    if (getAllInndelinger().length > 0) clearInndelingerAndSources();
  };

  return resetMap;
};

export default useMapReset;
