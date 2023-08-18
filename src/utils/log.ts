import { getCurrentEnvironment } from "components/FeatureToggle/FeatureToggle";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logDevOnly = (...data: any[]) => {
  if (getCurrentEnvironment() === "dev") {
    // eslint-disable-next-line no-console
    console.log(...data);
  }
};
