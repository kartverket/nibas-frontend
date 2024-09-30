import React from "react";

// du kan override lokal verdi ved å opprette key i .env.local
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLocalEnvironmentOverride = (envKey: string) => {
  return import.meta.env[envKey] === "true";
};

export type Environment = "localhost" | "prod" | "dev-main" | "dev-e2e";

export enum NibasOrigin {
  LOCALHOST = "http://localhost:3000",
  DEV_E2E = "nibas-e2e.atkv3-dev.kartverket-intern.cloud",
  DEV_MAIN = "nibas.atkv3-dev.kartverket-intern.cloud",
  PROD = "nibas.kartverket-intern.cloud",
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
type Keys = "EKSEMPEL_TOGGLE";

const featureToggles: Record<Keys, Record<Environment, boolean>> = {
  EKSEMPEL_TOGGLE: {
    prod: false,
    "dev-main": getLocalEnvironmentOverride("VITE_FEATURE_TOGGLE_EKSEMPEL"),
    "dev-e2e": getLocalEnvironmentOverride("VITE_FEATURE_TOGGLE_EKSEMPEL"),
    localhost: getLocalEnvironmentOverride("VITE_FEATURE_TOGGLE_EKSEMPEL"),
  },
};

export const getCurrentEnvironment = (): Environment => {
  const { origin: url } = window.location;
  if (Object.keys(environmentByUrl).includes(url)) {
    return environmentByUrl[url];
  }
  return "prod";
};

export const featureEnabled = (key: Keys): boolean => {
  const environment = getCurrentEnvironment();
  const { NODE_ENV } = import.meta.env;

  // skru på alle toggles i test, for å sikre at tester kjører
  if (NODE_ENV === "test") {
    return true;
  }

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
