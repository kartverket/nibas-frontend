import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "pages/App/App";
import ThirdPartyProviders from "pages/App/ThirdPartyProviders";
import { matchRoutes } from "react-router-dom";
import {
  createReactRouterV6DataOptions,
  getWebInstrumentations,
  initializeFaro,
  ReactIntegration,
} from "@grafana/faro-react";
import { getCurrentEnvironment } from "components/FeatureToggle";

initializeFaro({
  app: {
    name: "nibas-frontend",
    namespace: "main",
    environment: getCurrentEnvironment(),
  },
  url: "https://faro.atgcp1-prod.kartverket.cloud/collect",
  instrumentations: [
    ...getWebInstrumentations(),
    new ReactIntegration({
      router: createReactRouterV6DataOptions({
        matchRoutes,
      }),
    }),
  ],
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ThirdPartyProviders>
      <App />
    </ThirdPartyProviders>
  </React.StrictMode>,
);
