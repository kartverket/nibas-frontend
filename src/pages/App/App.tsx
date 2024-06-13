import {
  Route,
  Navigate,
  useOutlet,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import Providers from "./Providers";
import PageLayout from "../Kart/PageLayout";
import { Suspense, useEffect } from "react";
import Loading from "./Loading";
import Landing from "pages/Landing/Landing";
import { routes } from "utils/routes";
import Utkast from "pages/Utkast/Utkast";
import EnvironmentOverlay from "./EnvironmentOverlay";
import { ErrorBoundaryWithFrontendLogger } from "components/FrontendLogger/FrontendLoggerErrorBoundry";
import { AfterAuthentication } from "components/Authentication/AfterAuthentication";
import {
  AuthenticationWrapper,
  AuthError,
  AuthLogIn,
  AuthNotAuthorized,
} from "components/Authentication/Authentication";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { AuthRenewError } from "components/Authentication/AuthRenewError";
import { UtkastRestoreAfterReauth } from "pages/Utkast/UtkastRestoreAfterReauth";
import {
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration,
  ReactRouterVersion,
  withFaroRouterInstrumentation,
} from "@grafana/faro-react";

initializeFaro({
  url: "http://faro.atkv3-sandbox.kartverket.cloud/collect",
  app: {
    name: "nibas-frontend",
  },
  instrumentations: [
    ...getWebInstrumentations(),
    new ReactIntegration({
      router: {
        version: ReactRouterVersion.V6_data_router,
        dependencies: {
          matchRoutes,
        },
      },
    }),
  ],
});

const App = () => {
  const { token } = useAuthentication();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<ErrorBoundaryWithFrontendLogger authToken={token} />}>
        <Route path={routes.authentication} element={<AuthenticationWrapper />}>
          <Route index element={<AuthLogIn />} />
          <Route path={routes.notAuthorized} element={<AuthNotAuthorized />} />
          <Route path={routes.authError} element={<AuthError />} />
        </Route>
        <Route path={routes.afterAuthentication} element={<AfterAuthentication />} />
        <Route path={routes.logout} element={<Navigate to={routes.index} replace={true} />} />
        <Route element={<ProtectedPage />}>
          <Route index element={<Landing />} />
          <Route path={routes.utkast} element={<UtkastRestoreAfterReauth />}>
            <Route index element={<Utkast />} />
            <Route path={routes.utkastId} element={<PageLayout />} />
          </Route>
          <Route path={routes.kart} element={<PageLayout />} />
        </Route>
      </Route>,
    ),
  );

  const instrumentedRouter = withFaroRouterInstrumentation(router);

  return (
    <Suspense fallback={<Loading />}>
      <EnvironmentOverlay>
        <RouterProvider router={instrumentedRouter} />
      </EnvironmentOverlay>
    </Suspense>
  );
};

const ProtectedPage = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthorization, isLoading, user } = useAuthentication();
  useEffect(() => {
    if (isAuthenticated) {
      checkAuthorization().then((result) => {
        if (result === "NOT_AUTHORIZED") {
          navigate(`${routes.authentication}/${routes.notAuthorized}`);
        } else if (result === "ERROR") {
          navigate(`${routes.authentication}/${routes.authError}`);
        }
      });
    }
  }, [isAuthenticated, checkAuthorization, navigate, user]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.authentication} replace={true} />;
  }

  return (
    <Providers>
      <AuthRenewError>{outlet}</AuthRenewError>
    </Providers>
  );
};

export default App;
