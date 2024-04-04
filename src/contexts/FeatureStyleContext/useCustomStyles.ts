import Style, { StyleFunction } from "ol/style/Style";
import { useState } from "react";
import { getArchivedSource, getEditSource } from "utils/map/layers";

// Hjelpehook som holder styr på hvilke features som har en gitt custom stil
const useCustomStyles = (customStyle: StyleFunction | Style[]) => {
  const [customFeatureIds, setCustomFeatureIds] = useState<string[]>([]);
  const [savedCustomFeatureIds, setSavedCustomFeatureIds] = useState<string[]>([]);

  const renderCustomStyles = (featureIds: string[]) => {
    for (const featureId of featureIds) {
      setFeatureStyle(featureId, customStyle);
    }
  };
  const renderSavedCustomStyles = () => renderCustomStyles(savedCustomFeatureIds);

  // Setter en custom stil på gitte features, samt lagrede features som skal ha samme stil
  const setCustomStyles = (featureIds: string[]) => {
    renderCustomStyles(featureIds);
    setCustomFeatureIds(featureIds);
  };

  // Legger til custom stil på features gitt at de ikke allerede har den
  const addCustomStyles = (featureIds: string[]) => {
    renderCustomStyles(featureIds);
    setCustomFeatureIds(customFeatureIds.concat(featureIds.filter((fid) => !customFeatureIds.includes(fid))));
  };

  // Fjerner custom stil fra gitte features, tilbakestiller til edit-stil
  const removeCustomStyles = (featureIds: string[]) => {
    setCustomFeatureIds(customFeatureIds.filter((cfi) => !featureIds.includes(cfi)));
  };

  // Mellomlagrer lagrede features med den gitte stilen slik at de ikke blir tilbakestilt til edit-stil
  const saveCustomStyles = () => {
    setSavedCustomFeatureIds([...savedCustomFeatureIds, ...customFeatureIds]);
    setCustomFeatureIds([]);
  };

  // Sender features med lagrede stiler fra utkastet direkte til listen av lagrede features
  const setAndSaveCustomStyles = (featureIds: string[]) => {
    if (featureIds.length > 0) {
      renderCustomStyles(featureIds);
      setSavedCustomFeatureIds([...savedCustomFeatureIds, ...featureIds]);
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

/**
 * Liten hjelpefunksjon for å slippe så mye typehåndtering når man skal sette stiler
 * @param featureId En gitt feature i editSource eller archivedSource som skal få ny stil
 * @param style Stil fra grenseStyles eller en stilfunksjon
 */
export const setFeatureStyle = (featureId: string, style: Style[] | StyleFunction) => {
  const sources = [getArchivedSource(), getEditSource()];
  for (const source of sources) {
    const feature = source?.getFeatureById(featureId);
    feature?.setStyle(style);
  }
};

export default useCustomStyles;
