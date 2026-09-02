import React from "react";

export type Environment = "localhost" | "prod" | "dev-main" | "dev-e2e" | "feature-branch";

export enum NibasOrigin {
  LOCALHOST = "http://localhost:3000",
  DEV_E2E = "https://nibas-e2e.atkv3-dev.kartverket-intern.cloud",
  DEV_MAIN = "https://nibas-main.atkv3-dev.kartverket-intern.cloud",
  PROD = "https://nibas.kartverket-intern.cloud",
}

const environmentByUrl: Record<string, Environment> = {
  [NibasOrigin.LOCALHOST]: "localhost",
  [NibasOrigin.DEV_E2E]: "dev-e2e",
  [NibasOrigin.DEV_MAIN]: "dev-main",
  [NibasOrigin.PROD]: "prod",
};

// denne utvides etterhvert som vi får flere flagg
// noe som `type Keys = "flagg1" | "flagg2" | ...`
// features som skal fjernes kan slettes fra denne listen
// hvis det ikke er noen keys skal Keys være av typen `never`
type Keys = "CREATE_INNDELINGER";

const featureToggles: Record<Keys, Record<Environment, boolean>> = {
  CREATE_INNDELINGER: {
    prod: true,
    "dev-main": true,
    "dev-e2e": true,
    localhost: true,
    "feature-branch": true,
  },
};

export const getCurrentEnvironment = (): Environment => {
  const { origin } = window.location;
  // Hvis vi ikke er på en kjent og definert url antar vi at det er en feature-branch.
  // TODO: Dette kan være skummelt da man potensielt kan eksponere eksperimentelle features til ikke-feature-branch-miljøer ved endringer av origins.
  return environmentByUrl[origin] ?? "feature-branch";
};

export const featureEnabled = (key: Keys): boolean => {
  const environment = getCurrentEnvironment();

  if (!environment) {
    return false;
  }

  return featureToggles[key][environment];
};

// Da kan vi bruke feks Unleash som har samme navn på hook
export const useFlag = (key: Keys) => {
  return featureEnabled(key);
};

type Props = {
  feature: Keys;
  children: React.ReactElement;
};

const FeatureToggle = ({ feature, children }: Props) => {
  if (featureEnabled(feature)) {
    return children;
  }

  return null;
};

export default FeatureToggle;
