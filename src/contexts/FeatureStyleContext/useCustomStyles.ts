import Style, { StyleFunction } from "ol/style/Style";
import { useState } from "react";
import { setFeatureStyle } from "utils/map/layerStyles";
import { getUniqueItems } from "utils/list-utils";

// Hjelpehook som holder styr på hvilke features som har en gitt custom stil
const useCustomStyles = (customStyle: StyleFunction | Style[]) => {
  const [customFeatureIds, setCustomFeatureIds] = useState<string[]>([]);
  const [savedCustomFeatureIds, setSavedCustomFeatureIds] = useState<string[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const [batchTimeout, setBatchTimeout] = useState<number | null>(null);

  const renderCustomStyles = (featureIds: string[]) => {
    const uniqueIds = getUniqueItems(featureIds);
    const newPendingUpdates = new Set([...pendingUpdates, ...uniqueIds]);
    setPendingUpdates(newPendingUpdates);

    if (batchTimeout !== null) {
      window.clearTimeout(batchTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      requestAnimationFrame(() => {
        newPendingUpdates.forEach((id) => {
          setFeatureStyle(id, customStyle);
        });
        setPendingUpdates(new Set());
      });
      setBatchTimeout(null);
    }, 16);

    setBatchTimeout(timeoutId);
  };

  const renderSavedCustomStyles = () => renderCustomStyles(savedCustomFeatureIds);

  // Setter en custom stil på gitte features, samt lagrede features som skal ha samme stil
  const setCustomStyles = (featureIds: string[]) => {
    const uniqueIds = getUniqueItems(featureIds);
    renderCustomStyles(uniqueIds);
    setCustomFeatureIds(uniqueIds);
  };

  // Legger til custom stil på features gitt at de ikke allerede har den
  const addCustomStyles = (featureIds: string[]) => {
    const newIds = featureIds.filter((fid) => !customFeatureIds.includes(fid));
    if (newIds.length > 0) {
      renderCustomStyles(newIds);
      setCustomFeatureIds((prev) => [...prev, ...newIds]);
    }
  };

  // Fjerner custom stil fra gitte features, tilbakestiller til edit-stil
  const removeCustomStyles = (featureIds: string[]) => {
    setCustomFeatureIds((prev) => prev.filter((cfi) => !featureIds.includes(cfi)));
  };

  // Mellomlagrer lagrede features med den gitte stilen slik at de ikke blir tilbakestilt til edit-stil
  const saveCustomStyles = () => {
    setSavedCustomFeatureIds((prev) => [...prev, ...customFeatureIds]);
    setCustomFeatureIds([]);
  };

  // Sender features med lagrede stiler fra utkastet direkte til listen av lagrede features
  const setAndSaveCustomStyles = (featureIds: string[]) => {
    if (featureIds.length > 0) {
      const uniqueIds = getUniqueItems(featureIds);
      renderCustomStyles(uniqueIds);
      setSavedCustomFeatureIds((prev) => [...prev, ...uniqueIds]);
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
