import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { HistoryEntry, HistoryTypeValues, useHistory } from "contexts/HistoryContext";
import { FeatureStyleContextValue } from "./types";
import { useSelectStyles } from "./useSelectStyles";
import { getArchiveLayerStyle, grenseStyles, setFeatureStyle } from "utils/map/layerStyles";
import { FeatureLike } from "ol/Feature";
import useCustomStyles from "./useCustomStyles";

export const FeatureStyleContext = createContext<FeatureStyleContextValue | undefined>(undefined);

export const FeatureStyleProvider = ({ children }: { children: React.ReactNode }) => {
  const { history } = useHistory();
  const { selectedPoint, selectFeatures, selectedFeatures, selectPointOnFeature, clearSelection } = useSelectStyles();

  const sammenslaaingOverlappingStyleFunctions = useCustomStyles(grenseStyles.sammenslaaingOverlapping);
  const sammenslaaingStyleFunctions = useCustomStyles(grenseStyles.sammenslaaing);
  const archivedStyleFunctions = useCustomStyles(getArchiveLayerStyle);
  const dirtyStyleFunctions = useCustomStyles(grenseStyles.dirty);

  // OBS! Rekkefølgen avgjør prioriteten til stilene, høyest i listen er høyest prioritet.
  const customStyles = useMemo(
    () => [
      sammenslaaingOverlappingStyleFunctions,
      sammenslaaingStyleFunctions,
      archivedStyleFunctions,
      dirtyStyleFunctions,
    ],
    [archivedStyleFunctions, dirtyStyleFunctions, sammenslaaingOverlappingStyleFunctions, sammenslaaingStyleFunctions],
  );

  const previousSelectedFeatures = useRef(selectedFeatures);

  // Når en feature ikke er valgt lengre må vi avgjøre hvilken stil den skal ha
  useEffect(() => {
    const deselectedFeatures = previousSelectedFeatures.current.filter(
      (psf) => !selectedFeatures.some((sf) => psf.getId() === sf.getId()),
    );

    for (const feature of deselectedFeatures) {
      const featureId = feature.getId() as string;
      for (const customStyle of customStyles) {
        if (customStyle.customFeatureIds.includes(featureId) || customStyle.savedCustomFeatureIds.includes(featureId)) {
          feature.setStyle(customStyle.customStyle);
          return;
        }
      }

      feature.setStyle();
    }
    previousSelectedFeatures.current = selectedFeatures;
  }, [selectedFeatures, customStyles]);

  const getFeatureIdsFromEntries = (accumulator: string[][], entry: HistoryEntry) => {
    const featureIds: string[] = [];
    entry.changes.forEach((change) => {
      if (change.to && !accumulator.some((value) => value.includes(change.id))) {
        featureIds.push(change.id);
      }
    });
    accumulator.push(featureIds);
    return accumulator;
  };

  const undoFeatureStyles = useCallback(
    (featureIds: string[]) => {
      for (const featureId of featureIds) {
        if (customStyles.every((cs) => !cs.savedCustomFeatureIds.includes(featureId))) {
          setFeatureStyle(featureId, grenseStyles.edit);
        }
      }

      for (const customStyle of customStyles) {
        customStyle.renderSavedCustomStyles();
        customStyle.removeCustomStyles(featureIds);
      }
    },
    [customStyles],
  );

  useEffect(() => {
    const dirtyHistoryTypes: HistoryTypeValues[] = ["grense", "property", "grensetilhorighetendring", "nygrense"];

    // Når vi lagrer blir history entries tømt, så vi lagrer stilene som er satt
    if (history.entries.length === 0) {
      if (history.hasPreviouslySavedHistory) {
        if (dirtyStyleFunctions.customFeatureIds.length !== 0) dirtyStyleFunctions.saveCustomStyles();
        if (archivedStyleFunctions.customFeatureIds.length !== 0) archivedStyleFunctions.saveCustomStyles();
      }
      // Dersom vi ikke har lagret history fra før returnerer vi for å forhindre uendelig løkke
      return;
    }

    // Alle entries etter index (angrede endringer) skal tilbakestilles
    const editFeatures = history.entries
      .slice(history.index)
      .reduce(getFeatureIdsFromEntries, [])
      .flatMap((id) => id);

    // Entries før index skal fargelegges basert på endringen som er gjort
    const dirtyFeatures = history.entries
      .slice(0, history.index)
      .filter((entry) => dirtyHistoryTypes.includes(entry.type))
      .reduce(getFeatureIdsFromEntries, [])
      .flatMap((id) => id);

    const archivedFeatures = history.entries
      .slice(0, history.index)
      .filter((entry) => entry.type === "grensearkivering" || entry.type === "grensesplitting")
      .reduce(getFeatureIdsFromEntries, [])
      .flatMap((id) => id);

    // For å forhindre uendelig løkke
    if (
      dirtyStyleFunctions.customFeatureIds.length === dirtyFeatures.length &&
      archivedStyleFunctions.customFeatureIds.length === archivedFeatures.length
    ) {
      return;
    }

    // Obs: sammenslåing skal egentlig være her også, men den lagres umiddelbart og kan uansett ikke angres
    undoFeatureStyles(editFeatures);
    dirtyStyleFunctions.setCustomStyles(dirtyFeatures);
    archivedStyleFunctions.setCustomStyles(archivedFeatures);
  }, [
    history.entries,
    history.index,
    history.hasPreviouslySavedHistory,
    history,
    undoFeatureStyles,
    dirtyStyleFunctions,
    archivedStyleFunctions,
  ]);

  const clearFeatureStyles = () => {
    for (const customStyle of customStyles) {
      customStyle.clearCustomStyles();
    }
  };

  const featureIsArchived = (feature: FeatureLike) => {
    const featureId = feature.getId() as string;
    if (featureId) {
      return (
        archivedStyleFunctions.customFeatureIds.includes(featureId) ||
        archivedStyleFunctions.customFeatureIds.includes(featureId)
      );
    }
    return false;
  };

  const value = {
    selectFeatures,
    selectPointOnFeature,
    selectedFeatures,
    selectedPoint,
    clearSelection,

    addDirtyStyles: dirtyStyleFunctions.addCustomStyles,
    setAndSaveDirtyStyles: dirtyStyleFunctions.setAndSaveCustomStyles,

    addArchivedStyles: archivedStyleFunctions.addCustomStyles,
    setAndSaveArchivedStyles: archivedStyleFunctions.setAndSaveCustomStyles,
    featureIsArchived,

    setAndSaveSammenslaaingStyles: sammenslaaingStyleFunctions.setAndSaveCustomStyles,
    setAndSaveSammenslaaingOverlappingStyles: sammenslaaingOverlappingStyleFunctions.setAndSaveCustomStyles,
    clearFeatureStyles,
  };

  return <FeatureStyleContext.Provider value={value}>{children}</FeatureStyleContext.Provider>;
};

export const useFeatureStyle = () => {
  const context = useContext(FeatureStyleContext);
  if (!context) {
    throw new Error("useFeatureStyle must be used within a FeatureStyleContext");
  }

  return context;
};
