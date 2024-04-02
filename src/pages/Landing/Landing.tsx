import ActionCard from "components/ActionCard";
import { Page, PageContainer } from "components/Page";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetMapView } from "utils/map/map-utils";
import { routes } from "utils/routes";
import Greeting from "./Greeting";
import LandingHeader from "./LandingHeader";
import PrivacyFooter from "./PrivacyFooter";

const Landing = () => {
  const navigate = useNavigate();
  const { resetKartlag } = useKartlag();
  const { resetTool, resetModeTools } = useToolbar();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();

  useEffect(() => {
    resetMapView();
    resetKartlag();
    resetTool();
    resetModeTools();

    // Disse to krever ekstra sjekking for å unngå uendelig useEffekt-løkke
    if (activeOverlayPanel) closeOverlayPanel();
  }, [activeOverlayPanel, closeOverlayPanel, resetKartlag, resetModeTools, resetTool]);

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
