import { FeatureStyleContext } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { ReactNode } from "react";

/* eslint-disable  @typescript-eslint/no-explicit-any */

const mockFeatureStyleContextValue = {
  setFeatureStylesForUtkast: vitest.fn(),
  setAndSaveFremtidigEndringStyles: vitest.fn(),
};

const MockFeatureStyleProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FeatureStyleContext.Provider value={mockFeatureStyleContextValue as any}>{children}</FeatureStyleContext.Provider>
  );
};

export { MockFeatureStyleProvider };
