import {
  ConfigureAuthFlowProps,
  useConfigureAuthFlow,
} from "@kartverket/frontend-aut-lib";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Providers from "./Providers";
import LogoutButton from "components/Authentication/LogoutButton";
import ProtectedTokenInfo from "components/Authentication/ProtectedTokenInfo";
import StatusBar from "components/Authentication/StatusBar";
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
      <StatusBar />
      <LogoutButton />
      <div>
        <ul>
          <li>
            <Link to="/">Home sweet home</Link>
          </li>
          <li>
            <Link to="/protectedTokenInfo">
              Link til info om token (autentisering påkrevd)
            </Link>
          </li>
          <li>
            <Link to="/app">Link til app</Link>
          </li>
        </ul>
      </div>
      <Routes>
        {redirectAfterLogon}
        {redirectAfterLogout}
        <Route path="/protectedTokenInfo" element={<ProtectedTokenInfo />} />
        <Route
          path="/app"
          element={
            <Providers>
              <PageLayout />
            </Providers>
          }
        ></Route>
      </Routes>
    </Router>
  );
};

export default App;
