import { useFeatureFlagEnabled } from "posthog-js/react";
import posthog from "posthog-js";
import React from "react";

type Keys = "archive-inndeling" | "delete-inndeling";

export const featureEnabled = (key: Keys): boolean => {
  return posthog.isFeatureEnabled(key) ?? false;
};

type Props = {
  feature: Keys;
  children: React.ReactElement;
};

const FeatureToggle = ({ feature, children }: Props) => {
  const enabled = useFeatureFlagEnabled(feature) ?? false;
  return enabled ? children : null;
};

export default FeatureToggle;

export type Environment = "localhost" | "prod" | "dev-main" | "dev-e2e";

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

export const getCurrentEnvironment = (): Environment => {
  const { origin } = window.location;
  return environmentByUrl[origin];
};
