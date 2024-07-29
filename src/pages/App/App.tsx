import {
  Route,
  Navigate,
  useOutlet,
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { withFaroRouterInstrumentation } from "@grafana/faro-react";
import Providers from "./Providers";
import PageLayout from "../Kart/PageLayout";
import { Suspense, useEffect } from "react";
import Loading from "./Loading";
import Landing from "pages/Landing/Landing";
import { routes } from "utils/routes";
import Utkast from "pages/Utkast/Utkast";
import EnvironmentOverlay from "./EnvironmentOverlay";
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
import "cypress-globals";
import { FullPageErrorWithFaroErrorBoundry } from "components/FullPageError";

const App = () => {
  const router = withFaroRouterInstrumentation(
    createBrowserRouter(
      createRoutesFromElements(
        <Route element={<FullPageErrorWithFaroErrorBoundry />}>
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
    ),
  );

  return (
    <Suspense fallback={<Loading />}>
      <EnvironmentOverlay>
        <RouterProvider router={router} />
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
