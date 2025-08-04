import Style, { StyleFunction } from "ol/style/Style";
import { useState, useEffect, useCallback } from "react";
import { setFeatureStyle } from "utils/map/layerStyles";
import { getUniqueItems } from "utils/list-utils";

// Hjelpehook som holder styr på hvilke features som har en gitt custom stil
const useCustomStyles = (customStyle: StyleFunction | Style[]) => {
  const [customFeatureIds, setCustomFeatureIds] = useState<string[]>([]);
  const [savedCustomFeatureIds, setSavedCustomFeatureIds] = useState<string[]>([]);

  const renderCustomStyles = useCallback(
    (featureIds: string[]) => {
      for (const featureId of getUniqueItems(featureIds)) {
        setFeatureStyle(featureId, customStyle);
      }
    },
    [customStyle],
  );

  // Oppdaterer custom stiler når customFeatureIds endres
  useEffect(() => {
    if (customFeatureIds.length > 0) {
      renderCustomStyles(customFeatureIds);
    }
  }, [customFeatureIds, renderCustomStyles]);

  // Oppdaterer lagrede stiler når savedCustomFeatureIds endres
  useEffect(() => {
    if (savedCustomFeatureIds.length > 0) {
      renderCustomStyles(savedCustomFeatureIds);
    }
  }, [savedCustomFeatureIds, renderCustomStyles]);

  const renderSavedCustomStyles = () => renderCustomStyles(savedCustomFeatureIds);

  // Setter en custom stil på gitte features, samt lagrede features som skal ha samme stil
  const setCustomStyles = (featureIds: string[]) => {
    setCustomFeatureIds(featureIds);
  };

  // Legger til custom stil på features gitt at de ikke allerede har den
  const addCustomStyles = (featureIds: string[]) => {
    setCustomFeatureIds((prevIds) => prevIds.concat(featureIds.filter((fid) => !prevIds.includes(fid))));
  };

  // Fjerner custom stil fra gitte features, tilbakestiller til edit-stil
  const removeCustomStyles = (featureIds: string[]) => {
    setCustomFeatureIds((prevIds) => prevIds.filter((cfi) => !featureIds.includes(cfi)));
  };

  // Mellomlagrer lagrede features med den gitte stilen slik at de ikke blir tilbakestilt til edit-stil
  const saveCustomStyles = () => {
    setCustomFeatureIds((prevCustomIds) => {
      setSavedCustomFeatureIds((prevSavedIds) => [...prevSavedIds, ...prevCustomIds]);
      return [];
    });
  };

  // Sender features med lagrede stiler fra utkastet direkte til listen av lagrede features
  const setAndSaveCustomStyles = (featureIds: string[]) => {
    if (featureIds.length > 0) {
      setSavedCustomFeatureIds((prevIds) => [...prevIds, ...featureIds]);
    }
  };

  // Tilbakestiller kun React-staten, ikke selve featurene i kartet
  const clearCustomStyles = () => {
    setSavedCustomFeatureIds([]);
    setCustomFeatureIds([]);
  };

  return {
    customStyle,
    customFeatureIds,
    savedCustomFeatureIds,
    setCustomStyles,
    addCustomStyles,
    removeCustomStyles,
    saveCustomStyles,
    setAndSaveCustomStyles,
    clearCustomStyles,
    renderSavedCustomStyles,
  };
};

export default useCustomStyles;
