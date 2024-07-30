import React from "react";

// du kan override lokal verdi ved å opprette key i .env.local
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLocalEnvironmentOverride = (envKey: string) => {
  return import.meta.env[envKey] === "true";
};

export type Environment = "prod" | "dev";

const environmentByUrl: Record<string, Environment> = {
  localhost: "dev",
  "nibas.atkv3-dev.kartverket.cloud": "dev",
  "nibas.atkv3-prod.kartverket.cloud": "prod",
};

// denne utvides etterhvert som vi får flere flagg
// noe som `type Keys = "flagg1" | "flagg2" | ...`
// features som skal fjernes kan slettes fra denne listen
// hvis det ikke er noen keys skal Keys være av typen `never`
type Keys = "EKSEMPEL_TOGGLE";

const featureToggles: Record<Keys, Record<Environment, boolean>> = {
  EKSEMPEL_TOGGLE: {
    prod: false,
    dev: getLocalEnvironmentOverride("VITE_FEATURE_TOGGLE_EKSEMPEL"),
  },
};

export const getCurrentEnvironment = (): Environment => {
  const { hostname } = window.location;
  return environmentByUrl[hostname] ?? "prod";
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
