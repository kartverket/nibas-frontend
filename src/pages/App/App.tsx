import { withFaroRouterInstrumentation } from "@grafana/faro-react";
import Landing from "pages/Landing/Landing";
import Utkast from "pages/Utkast/Utkast";
import { Suspense } from "react";
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from "react-router-dom";
import { routes } from "utils/routes";
import PageLayout from "../Kart/PageLayout";
import EnvironmentOverlay from "./EnvironmentOverlay";
import Loading from "./Loading";
import Providers from "./Providers";
import { FullPageErrorWithFaroErrorBoundry } from "components/FullPageError";
import "cypress-globals";
import { Endringer } from "pages/Endringer/Endringer";
import { UtkastRestore } from "pages/Utkast/UtkastRestore";

const App = () => {
  const router = withFaroRouterInstrumentation(
    createBrowserRouter(
      createRoutesFromElements(
        <Route element={<FullPageErrorWithFaroErrorBoundry />}>
          <Route element={<ProvidersRoute />}>
            <Route index element={<Landing />} />
            <Route path={routes.utkast} element={<UtkastRestore />}>
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
