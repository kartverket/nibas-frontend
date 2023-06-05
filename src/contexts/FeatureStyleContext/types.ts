export type FeatureStyleContextValue = {
  setAndSaveUtkastFeatures: (features: string[]) => void;
  setAndSaveSammenslaaingsFeatures: (
    features: string[],
    overlappingFeatures: string[]
  ) => void;
  dirtyFeatureIds: string[];
  clearDirtyStyles: () => void;
};
