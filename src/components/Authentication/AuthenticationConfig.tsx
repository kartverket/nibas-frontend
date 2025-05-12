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

const getDevConfig = () => {
  return {
    authority: "https://test.idporten.no",
    client_id: "7543d671-d166-4222-8f53-a92718cc7b92",
    redirect_uri: `${window.location.origin}/authenticated`,
  };
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
      return getDevConfig();
    case "prod":
      return prodConfig;
    case "dev-e2e":
      return getDevConfig();
    case "localhost":
      return localConfig;
    case "feature-branch": {
      return getDevConfig();
    }
  }
};
