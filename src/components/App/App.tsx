import {
  ConfigureAuthFlowProps,
  useConfigureAuthFlow,
} from "@kartverket/frontend-aut-lib";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import Providers from "./Providers";
import PageLayout from "components/PageLayout";

/**
 * Definerer 3 verdier i konfigurasjonen. Disse brukes av biblioteket forskjellige steder i flyten.
 */
const authFlowProps: ConfigureAuthFlowProps = {
  systemId: "nibas",
  fallbackUrl: "/",
  afterUserLogoutRedirect: "/",
};

/**
 * Bruker hook useConfigureAuthFlow for å lagre verdiene angitt over i ConfigureAuthFlowProps.
 * Denne returnerer 2 <Route>-objekter som brukes i routingen (se lenger ned) for å kunne initialisere logikk knyttet
 * til autentiseringsflyten, samt utloggingsflyt. Siden disse returneres i en array, kan de brukes direkte i routing-JSX.
 */

const App = () => {
  const [redirectAfterLogon, redirectAfterLogout]: JSX.Element[] =
    useConfigureAuthFlow(authFlowProps);
  return (
    <Router>
      <Providers>
        <PageLayout />
      </Providers>
      <Routes>
        {redirectAfterLogon}
        {redirectAfterLogout}
      </Routes>
    </Router>
  );
};

export default App;
