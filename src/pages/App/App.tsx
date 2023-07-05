import {
  ConfigureAuthFlowProps,
  useConfigureAuthFlow,
} from "@kartverket/frontend-aut-lib";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useOutlet,
} from "react-router-dom";
import Providers from "./Providers";
import PageLayout from "../Kart/PageLayout";
import { ReactNode, Suspense } from "react";
import {
  AuthorizationStatus,
  useAuthorization,
} from "../Authentication/AuthHooks";
import { FullPageLoader } from "./AppLoader";
import Authentication from "pages/Authentication/Authentication";
import Landing from "pages/Landing/Landing";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { routes } from "utils/routes";

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

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Router>
        <Routes>
          {redirectAfterLogon}
          {redirectAfterLogout}
          <Route path={routes.authentication} element={<ExternalPage />} />
          <Route element={<ProtectedPage />}>
            <Route index element={<Landing />} />
            <Route path={routes.utkast} element={<p>Her kommer utkast!</p>} />
            <Route path={routes.kart} element={<PageLayout />} />
          </Route>
        </Routes>
      </Router>
    </Suspense>
  );
};

const ExternalPage = () => {
  const { status } = useAuthorization();
  const isAuthorized = status === AuthorizationStatus.AUTHORIZED;
  const isLocalhost = window.location.hostname === "localhost";

  if (isAuthorized || isLocalhost) {
    return <Navigate to={routes.index} />;
  }

  return (
    <ThirdPartyProviders>
      <Authentication />
    </ThirdPartyProviders>
  );
};

const ProtectedPage = () => {
  const outlet = useOutlet();
  const { status } = useAuthorization();
  const isAuthorized = status === AuthorizationStatus.AUTHORIZED;
  const isLocalhost = window.location.hostname === "localhost";

  if (!isAuthorized && !isLocalhost) {
    return <Navigate to={routes.authentication} />;
  }

  return <Providers>{outlet}</Providers>;
};

export default App;
