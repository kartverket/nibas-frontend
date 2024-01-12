import ActionCard from "components/ActionCard";
import { Page, PageContainer } from "components/Page";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVisibleFeatures, resetMapView } from "utils/map";
import { routes } from "utils/routes";
import Greeting from "./Greeting";
import LandingHeader from "./LandingHeader";
import PrivacyFooter from "./PrivacyFooter";

const Landing = () => {
  const navigate = useNavigate();
  const { resetKartlag } = useKartlag();
  const { resetTool, resetModeTools } = useToolbar();
  const { resetAndClearAllLayers } = useEditAllGrenser();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();

  useEffect(() => {
    resetMapView();
    resetKartlag();
    resetTool();
    resetModeTools();

    const allVisibleFeatures = getAllVisibleFeatures();
    if (allVisibleFeatures.length > 0) {
      resetAndClearAllLayers();
    }

    // Disse to krever ekstra sjekking for å unngå uendelig useEffekt-løkke
    if (activeOverlayPanel) closeOverlayPanel();
    if (activeSidebarPanel) closeSidebarPanel();
  }, [
    activeOverlayPanel,
    activeSidebarPanel,
    closeOverlayPanel,
    closeSidebarPanel,
    resetAndClearAllLayers,
    resetKartlag,
    resetModeTools,
    resetTool,
  ]);

  return (
    <PageContainer>
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
      <PrivacyFooter />
    </PageContainer>
  );
};

export default Landing;
