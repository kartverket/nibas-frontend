import {
  ConfigureAuthFlowProps,
  useConfigureAuthFlow,
} from "@kartverket/frontend-aut-lib";
import {
  Route,
  Navigate,
  useOutlet,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Providers from "./Providers";
import PageLayout from "../Kart/PageLayout";
import { Suspense } from "react";
import {
  AuthorizationStatus,
  useAuthorization,
} from "../Authentication/AuthHooks";
import Loading from "./Loading";
import Authentication from "pages/Authentication/Authentication";
import Landing from "pages/Landing/Landing";
import ThirdPartyProviders from "./ThirdPartyProviders";
import { routes } from "utils/routes";
import Utkast from "pages/Utkast/Utkast";

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

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {redirectAfterLogon}
        {redirectAfterLogout}
        <Route path={routes.authentication} element={<ExternalPage />} />
        <Route element={<ProtectedPage />}>
          <Route index element={<Landing />} />
          <Route path={routes.utkast}>
            <Route index element={<Utkast />} />
            <Route path={routes.utkastId} element={<PageLayout />} />
          </Route>
          <Route path={routes.kart} element={<PageLayout />} />
        </Route>
      </>
    )
  );

  return (
    <Suspense fallback={<Loading isLoading={true} />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

const useAuthentication = () => {
  const { status } = useAuthorization();
  const isAuthorized = status === AuthorizationStatus.AUTHORIZED;
  const isLocalhost = window.location.hostname === "localhost";
  return { shouldAuthenticate: !isAuthorized && !isLocalhost };
};

const ExternalPage = () => {
  const { shouldAuthenticate } = useAuthentication();
  if (!shouldAuthenticate) return <Navigate to={routes.index} replace={true} />;
  return (
    <ThirdPartyProviders>
      <Authentication />
    </ThirdPartyProviders>
  );
};

const ProtectedPage = () => {
  const outlet = useOutlet();
  const { shouldAuthenticate } = useAuthentication();
  if (shouldAuthenticate)
    return <Navigate to={routes.authentication} replace={true} />;
  return <Providers>{outlet}</Providers>;
};

export default App;
