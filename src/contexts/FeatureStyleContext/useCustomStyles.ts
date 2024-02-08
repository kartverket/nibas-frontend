import Style, { StyleFunction } from "ol/style/Style";
import { useState } from "react";
import { setFeatureStyle } from "utils/map/layerStyles";

// Hjelpehook som holder styr på hvilke features som har en gitt custom stil
const useCustomStyles = (customStyle: StyleFunction | Style[]) => {
  const [customFeatureIds, setCustomFeatureIds] = useState<string[]>([]);
  const [savedCustomFeatureIds, setSavedCustomFeatureIds] = useState<string[]>([]);

  // Setter en custom stil på gitte features, samt lagrede features som skal ha samme stil
  const setCustomStyles = (featureIds: string[]) => {
    for (const featureId of featureIds) {
      setFeatureStyle(featureId, customStyle);
    }
    for (const featureId of savedCustomFeatureIds) {
      setFeatureStyle(featureId, customStyle);
    }
    setCustomFeatureIds(featureIds);
  };

  // Legger til custom stil på features gitt at de ikke allerede har den
  const addCustomStyles = (featureIds: string[]) => {
    for (const featureId of featureIds) {
      setFeatureStyle(featureId, customStyle);
    }
    setCustomFeatureIds(customFeatureIds.concat(featureIds.filter((fid) => !customFeatureIds.includes(fid))));
  };

  // Mellomlagrer lagrede features med den gitte stilen slik at de ikke blir tilbakestilt til edit-stil
  const saveCustomStyles = () => {
    setSavedCustomFeatureIds([...savedCustomFeatureIds, ...customFeatureIds]);
    setCustomFeatureIds([]);
  };

  // Sender features med lagrede stiler fra utkastet direkte til listen av lagrede features
  const setAndSaveCustomStyles = (featureIds: string[]) => {
    for (const featureId of featureIds) {
      setFeatureStyle(featureId, customStyle);
    }
    setSavedCustomFeatureIds([...savedCustomFeatureIds, ...featureIds]);
  };

  // Tilbakestiller kun React-staten, ikke selve featurene i kartet
  const clearCustomStyles = () => {
    setSavedCustomFeatureIds([]);
    setCustomFeatureIds([]);
  };

  return {
    customFeatureIds,
    savedCustomFeatureIds,
    setCustomStyles,
    addCustomStyles,
    saveCustomStyles,
    setAndSaveCustomStyles,
    clearCustomStyles,
  };
};

export default useCustomStyles;
