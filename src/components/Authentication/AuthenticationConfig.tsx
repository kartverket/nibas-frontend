import { NibasOrigin, getCurrentEnvironment } from "components/FeatureToggle";

export const isAuthEnabled = () => {
  return !isAuthDisabled();
};

export const isAuthDisabled = () => {
  return getCurrentEnvironment() === "feature-branch";
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
    client_id: "91a73378-76d8-40cd-af04-6b7ce3d87667",
    redirect_uri: `${window.location.origin}/authenticated`,
  };
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
      return getDevConfig();
    case "feature-branch": {
      return getDevConfig();
    }
  }
};
