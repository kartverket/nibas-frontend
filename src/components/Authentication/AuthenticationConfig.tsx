import { NibasOrigin, getCurrentEnvironment } from "components/FeatureToggle";

const isLocalhost = () => {
  const { hostname } = window.location;
  return hostname.includes("localhost") || hostname.includes("127.0.0.1");
};

export const isAuthEnabled = () => {
  return !isAuthDisabled();
};

export const isAuthDisabled = () => {
  return isLocalhost() && import.meta.env["VITE_DISABLE_AUTH"] === "true";
};

type AuthConfig = {
  authority: string;
  client_id: string;
  redirect_uri: string;
};

const prodConfig = {
  authority: "https://idporten.no",
  client_id: "1a81c073-b363-4dce-b452-819cb7f38c2a",
  redirect_uri: `${NibasOrigin.PROD}/authenticated`,
};

const devConfig = {
  authority: "https://test.idporten.no",
  client_id: "91a73378-76d8-40cd-af04-6b7ce3d87667",
  redirect_uri: `${NibasOrigin.DEV_MAIN}/authenticated`,
};

const nibasE2EConfig = {
  authority: "https://test.idporten.no",
  client_id: "91a73378-76d8-40cd-af04-6b7ce3d87667",
  redirect_uri: `${NibasOrigin.DEV_E2E}/authenticated`,
};

const localConfig = {
  authority: "https://test.idporten.no",
  client_id: "91a73378-76d8-40cd-af04-6b7ce3d87667",
  redirect_uri: `${NibasOrigin.LOCALHOST}/authenticated`,
};

export const getAuthConfigForCurrentEnvironment = (): AuthConfig => {
  const environment = getCurrentEnvironment();
  switch (environment) {
    case "dev-main":
      return devConfig;
    case "prod":
      return prodConfig;
    case "dev-e2e":
      return nibasE2EConfig;
    case "localhost":
      return localConfig;
  }
};
