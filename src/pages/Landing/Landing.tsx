import { Card } from "@kvib/react";
import { Page } from "components/Page";
import { Link } from "react-router-dom";
import { routes } from "utils/routes";

const Landing = () => {
  return (
    <Page>
      <Link to={routes.utkast}>
        <Card>Gjør en eller flere endringer</Card>
      </Link>
      <Link to={routes.kart}>
        <Card>Finn og utforsk</Card>
      </Link>
    </Page>
  );
};

export default Landing;
