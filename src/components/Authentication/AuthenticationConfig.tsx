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

const getDevEnvConfig = () => {
  return {
    authority: "https://test.idporten.no",
    client_id: import.meta.env["VITE_OIDC_CLIENT_ID"],
    redirect_uri: import.meta.env["VITE_OIDC_REDIRECT_URI"],
  };
};

export const getAuthConfigForCurrentEnvironment = (): AuthConfig => {
  const environment = getCurrentEnvironment();
  if (environment === "prod") {
    return prodConfig;
  } else {
    return getDevEnvConfig();
  }
};
