import Style, { StyleFunction } from "ol/style/Style";
import { useRef, useState } from "react";
import { setFeatureStyle } from "utils/map/layerStyles";
import { getUniqueItems } from "utils/list-utils";

// Hjelpehook som holder styr på hvilke features som har en gitt custom stil
const useCustomStyles = (customStyle: StyleFunction | Style[]) => {
  const [, setCustomFeatureIds] = useState<string[]>([]);
  const [, setSavedCustomFeatureIds] = useState<string[]>([]);
  const customFeatureIds = useRef<string[]>([]);
  const savedCustomFeatureIds = useRef<string[]>([]);

  const updateCustomFeatureIds = (featureIds: string[]) => {
    customFeatureIds.current = featureIds;
    setCustomFeatureIds(featureIds);
  };

  const updateSavedCustomFeatureIds = (featureIds: string[]) => {
    savedCustomFeatureIds.current = featureIds;
    setSavedCustomFeatureIds(featureIds);
  };

  const renderCustomStyles = (featureIds: string[]) => {
    for (const featureId of getUniqueItems(featureIds)) {
      setFeatureStyle(featureId, customStyle);
    }
  };
  const renderSavedCustomStyles = () => renderCustomStyles(savedCustomFeatureIds.current);

  // Setter en custom stil på gitte features, samt lagrede features som skal ha samme stil
  const setCustomStyles = (featureIds: string[]) => {
    renderCustomStyles(featureIds);
    updateCustomFeatureIds(featureIds);
  };

  // Legger til custom stil på features gitt at de ikke allerede har den
  const addCustomStyles = (featureIds: string[]) => {
    renderCustomStyles(featureIds);
    updateCustomFeatureIds(
      customFeatureIds.current.concat(featureIds.filter((fid) => !customFeatureIds.current.includes(fid))),
    );
  };

  // Fjerner custom stil fra gitte features, tilbakestiller til edit-stil
  const removeCustomStyles = (featureIds: string[]) => {
    updateCustomFeatureIds(customFeatureIds.current.filter((cfi) => !featureIds.includes(cfi)));
  };

  const removeSavedCustomStyles = (featureIds: string[]) => {
    updateSavedCustomFeatureIds(savedCustomFeatureIds.current.filter((cfi) => !featureIds.includes(cfi)));
  };

  // Mellomlagrer lagrede features med den gitte stilen slik at de ikke blir tilbakestilt til edit-stil
  const saveCustomStyles = () => {
    updateSavedCustomFeatureIds([...savedCustomFeatureIds.current, ...customFeatureIds.current]);
    updateCustomFeatureIds([]);
  };

  // Sender features med lagrede stiler fra utkastet direkte til listen av lagrede features
  const setAndSaveCustomStyles = (featureIds: string[]) => {
    if (featureIds.length > 0) {
      renderCustomStyles(featureIds);
      updateSavedCustomFeatureIds([...savedCustomFeatureIds.current, ...featureIds]);
    }
  };

  // Tilbakestiller kun React-staten, ikke selve featurene i kartet
  const clearCustomStyles = () => {
    updateSavedCustomFeatureIds([]);
    updateCustomFeatureIds([]);
  };

  return {
    customStyle,
    get customFeatureIds() {
      return customFeatureIds.current;
    },
    get savedCustomFeatureIds() {
      return savedCustomFeatureIds.current;
    },
    setCustomStyles,
    addCustomStyles,
    removeCustomStyles,
    removeSavedCustomStyles,
    saveCustomStyles,
    setAndSaveCustomStyles,
    clearCustomStyles,
    renderSavedCustomStyles,
  };
};

export default useCustomStyles;
