import React from "react";

// du kan override lokal verdi ved å opprette key i .env.local
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDevValue = (envKey: string) => {
  return process.env[envKey] === "true";
};

type Environment = "prod" | "test" | "dev";

const environmentByUrl: Record<string, Environment> = {
  localhost: "dev",
  "nibas.dev.skip.statkart.no": "test",
};

// denne utvides etterhvert som vi får flere flagg
// noe som `type Keys = "flagg1" | "flagg2" | ...`
// features som skal fjernes kan slettes fra denne listen
// hvis det ikke er noen keys skal Keys være av typen `string`
type Keys = string;

const featureToggles: Record<Keys, Record<Environment, boolean>> = {};

export const featureEnabled = (key: Keys): boolean => {
  const { hostname } = window.location;
  const environment = environmentByUrl[hostname];
  const { NODE_ENV } = process.env;

  // skru på alle toggles i test, for å sikre at tester kjører
  if (NODE_ENV === "test") return true;

  if (!environment) return false;

  return featureToggles[key][environment];
};

// Da kan vi bruke feks Unleash som har samme navn på hook
export const useFlag = (key: Keys) => {
  return featureEnabled(key);
};

type Props = {
  key: Keys;
  children: React.ReactElement;
};

const FeatureToggle = ({ key, children }: Props) => {
  if (featureEnabled(key)) {
    return children;
  }

  return null;
};

export default FeatureToggle;
