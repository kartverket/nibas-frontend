import React from "react";

const featureToggles = {
  "delete-utkast": false,
  "test-feature-2": true,
  "test-feature-3": false,
};

type FeatureToggleKeys = keyof typeof featureToggles;

export const featureEnabled = (key: FeatureToggleKeys): boolean =>
  featureToggles[key];

type Props = {
  key: FeatureToggleKeys;
  children: React.ReactElement;
};

export const FeatureToggle = ({ key, children }: Props) => {
  if (featureEnabled(key)) {
    return children;
  }
  return null;
};

/*
 Eksempel på hvordan den kan brukes
 */

const MyComponent = () => {
  if (!featureEnabled("test-feature-2")) {
    return null;
  }

  return (
    <div>
      <p>En test</p>
      <FeatureToggle key={"test-feature-3"}>
        <p>Feature is enabled!</p>
      </FeatureToggle>
    </div>
  );
};
