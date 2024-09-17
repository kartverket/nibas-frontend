import ActionCard from "components/ActionCard";
import { Page, PageContainer } from "components/Page";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import Greeting from "./Greeting";
import LandingHeader from "./LandingHeader";
import PrivacyFooter from "./PrivacyFooter";
import useMapReset from "hooks/useMapReset";
import { useEffect } from "react";
import { format } from "date-fns";

const Landing = () => {
  const navigate = useNavigate();
  const resetMap = useMapReset();

  useEffect(() => {
    resetMap();
  }, [resetMap]);

  return (
    <PageContainer>
      <LandingHeader />
      <Page>
        <Greeting />
        <ActionCard
          title="Gjør en eller flere endringer"
          description="Opprett, rediger, eller publiser ett eller flere utkast med endringer."
          icon="draw"
          onClick={() => navigate(routes.utkast)}
        />
        <ActionCard
          title="Finn og utforsk"
          description="Se oppdaterte data uten å foreta deg noen endringer."
          icon="travel_explore"
          onClick={() => navigate(`kart/${format(new Date(), "yyyy-MM-dd")}`)}
        />
        <ActionCard
          title="Se fremtidige endringer"
          description="Se hvilke endringer som er publisert, men som ikke har intruffet enda."
          icon="event"
          onClick={() => navigate(routes.endringer)}
        />
      </Page>
      <PrivacyFooter />
    </PageContainer>
  );
};

export default Landing;
