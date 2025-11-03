import { Route, Outlet, createRoutesFromElements, createBrowserRouter, RouterProvider } from "react-router-dom";
import { withFaroRouterInstrumentation } from "@grafana/faro-react";
import Providers from "./Providers";
import PageLayout from "../Kart/PageLayout";
import { Suspense } from "react";
import Loading from "./Loading";
import Landing from "pages/Landing/Landing";
import { routes } from "utils/routes";
import Utkast from "pages/Utkast/Utkast";
import EnvironmentOverlay from "./EnvironmentOverlay";

import { UtkastRestoreAfterReauth } from "pages/Utkast/UtkastRestoreAfterReauth";
import "cypress-globals";
import { FullPageErrorWithFaroErrorBoundry } from "components/FullPageError";
import { Endringer } from "pages/Endringer/Endringer";

const App = () => {
  const router = withFaroRouterInstrumentation(
    createBrowserRouter(
      createRoutesFromElements(
        <Route element={<FullPageErrorWithFaroErrorBoundry />}>
          <Route element={<ProvidersRoute />}>
            <Route index element={<Landing />} />
            <Route path={routes.utkast} element={<UtkastRestoreAfterReauth />}>
              <Route index element={<Utkast />} />
              <Route path={routes.utkastId} element={<PageLayout />} />
            </Route>
            <Route path={routes.kart} element={<PageLayout />} />
            <Route path={routes.endringer} element={<Endringer />} />
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

const ProvidersRoute = () => (
  <Providers>
    <Outlet />
  </Providers>
);

export default App;
