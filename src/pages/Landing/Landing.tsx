import ActionCard from "components/ActionCard";
import { Page } from "components/Page";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import LandingHeader from "./LandingHeader";
import Greeting from "./Greeting";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useEffect } from "react";
import { resetMapView, getAllVisibleFeatures } from "utils/map";
import { useToolbar } from "contexts/ToolbarContext";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";

const Landing = () => {
  const navigate = useNavigate();
  const { resetKartlag } = useKartlag();
  const { activeTool, toggleTool } = useToolbar();
  const { resetAndClearAllLayers } = useEditAllGrenser();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();

  useEffect(() => {
    resetMapView();
    resetKartlag();
    if (activeTool) toggleTool(activeTool);
    if (activeOverlayPanel) closeOverlayPanel();
    if (activeSidebarPanel) closeSidebarPanel();
    const allVisibleFeatures = getAllVisibleFeatures();
    if (allVisibleFeatures.length > 0) {
      resetAndClearAllLayers();
    }
  }, [
    activeOverlayPanel,
    activeTool,
    activeSidebarPanel,
    closeOverlayPanel,
    closeSidebarPanel,
    resetAndClearAllLayers,
    resetKartlag,
    toggleTool,
  ]);

  return (
    <>
      <LandingHeader />
      <Page>
        <Greeting />
        <ActionCard
          title="Gjør en eller flere endringer"
          description="Opprett, rediger, eller publiser ett eller flere utkast med endringer."
          icon="edit_location_alt"
          onClick={() => navigate(routes.utkast)}
        />
        <ActionCard
          title="Finn og utforsk"
          description="Se oppdaterte data uten å foreta deg noen endringer."
          icon="travel_explore"
          onClick={() => navigate(routes.kart)}
        />
      </Page>
    </>
  );
};

export default Landing;
