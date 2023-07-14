import ActionCard from "components/ActionCard";
import { Page } from "components/Page";
import { useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import LandingHeader from "./LandingHeader";

const Landing = () => {
  const navigate = useNavigate();

  // TODO: mangler "God morgen!"-hilsen

  return (
    <>
      <LandingHeader />
      <Page>
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
