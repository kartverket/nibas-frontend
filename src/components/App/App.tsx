import {
  ConfigureAuthFlowProps,
  useAuthenticationFlow,
  useConfigureAuthFlow,
} from "@kartverket/frontend-aut-lib";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Providers from "./Providers";
import PageLayout from "components/PageLayout";
import Landing from "components/Landing/Landing";
import { Suspense } from "react";

/**
 * Definerer 3 verdier i konfigurasjonen. Disse brukes av biblioteket forskjellige steder i flyten.
 */
const authFlowProps: ConfigureAuthFlowProps = {
  systemId: "nibas",
  fallbackUrl: "/",
  afterUserLogoutRedirect: "/",
};

const App = () => {
  /**
   * Bruker hook useConfigureAuthFlow for å lagre verdiene angitt over i ConfigureAuthFlowProps.
   * Denne returnerer 2 <Route>-objekter som brukes i routingen (se lenger ned) for å kunne initialisere logikk knyttet
   * til autentiseringsflyten, samt utloggingsflyt.
   */
  const [redirectAfterLogon, redirectAfterLogout]: JSX.Element[] =
    useConfigureAuthFlow(authFlowProps);

  const { isAuthenticatedFunc } = useAuthenticationFlow();
  const { hostname } = window.location;
  const isLocalhost = hostname === "localhost";

  return (
    <Suspense fallback="Loading...">
      <Router>
        <Routes>
          {redirectAfterLogon}
          {redirectAfterLogout}
          <Route
            index
            element={
              isLocalhost || isAuthenticatedFunc() ? (
                <Providers>
                  <PageLayout />
                </Providers>
              ) : (
                <Landing />
              )
            }
          />
        </Routes>
      </Router>
    </Suspense>
  );
};

export default App;
