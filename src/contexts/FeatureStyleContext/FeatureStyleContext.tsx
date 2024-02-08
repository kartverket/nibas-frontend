import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { HistoryEntry, useHistory } from "contexts/HistoryContext";
import { FeatureStyleContextValue } from "./types";
import { useSelectStyles } from "./useSelectStyles";
import { getArchiveLayerStyle, grenseStyles, setFeatureStyle } from "utils/map/layerStyles";
import { FeatureLike } from "ol/Feature";
import useCustomStyles from "./useCustomStyles";

export const FeatureStyleContext = createContext<FeatureStyleContextValue | undefined>(undefined);

export const FeatureStyleProvider = ({ children }: { children: React.ReactNode }) => {
  const { history } = useHistory();
  const { selectedPoint, selectFeatures, selectedFeatures, selectPointOnFeature, clearSelection } = useSelectStyles();

  const {
    customFeatureIds: dirtyFeatureIds,
    savedCustomFeatureIds: savedDirtyFeatureIds,
    setCustomStyles: setDirtyStyles,
    addCustomStyles: addDirtyStyles,
    removeCustomStyles: removeDirtyStyles,
    saveCustomStyles: saveDirtyStyles,
    setAndSaveCustomStyles: setAndSaveDirtyStyles,
    clearCustomStyles: clearDirtyStyles,
    renderSavedCustomStyles: renderSavedDirtyStyles,
  } = useCustomStyles(grenseStyles.dirty);

  const {
    customFeatureIds: archivedFeatureIds,
    savedCustomFeatureIds: savedArchivedFeatureIds,
    setCustomStyles: setArchivedStyles,
    addCustomStyles: addArchivedStyles,
    removeCustomStyles: removeArchivedStyles,
    saveCustomStyles: saveArchivedStyles,
    setAndSaveCustomStyles: setAndSaveArchivedStyles,
    clearCustomStyles: clearArchivedStyles,
    renderSavedCustomStyles: renderSavedArchivedStyles,
  } = useCustomStyles(getArchiveLayerStyle);

  // Det er en del av funksjonaliteten vi ikke trenger til sammenslåing ettersom det lagres automatisk og ikke interagerer med history
  // Inkluderer likevel deler av det slik at det er lettere å se generaliseringsbehovet i konteksten
  const {
    customFeatureIds: sammenslaaingFeatureIds,
    savedCustomFeatureIds: savedSammenslaaingFeatureIds,
    setCustomStyles: setSammenslaaingStyles,
    removeCustomStyles: removeSammenslaaingStyles,
    setAndSaveCustomStyles: setAndSaveSammenslaaingStyles,
    clearCustomStyles: clearSammenslaaingStyles,
    renderSavedCustomStyles: renderSavedSammenslaaingStyles,
  } = useCustomStyles(grenseStyles.sammenslaaing);

  const {
    customFeatureIds: sammenslaaingOverlappingFeatureIds,
    savedCustomFeatureIds: savedSammenslaaingOverlappingFeatureIds,
    setCustomStyles: setSammenslaaingOverlappingStyles,
    removeCustomStyles: removeSammenslaaingOverlappingStyles,
    setAndSaveCustomStyles: setAndSaveSammenslaaingOverlappingStyles,
    clearCustomStyles: clearSammenslaaingOverlappingStyles,
    renderSavedCustomStyles: renderSavedSammenslaaingOverlappingStyles,
  } = useCustomStyles(grenseStyles.sammenslaaingOverlapping);

  const previousSelectedFeatures = useRef(selectedFeatures);

  // Når en feature ikke er valgt lengre må vi avgjøre hvilken stil den skal ha
  useEffect(() => {
    const deselectedFeatures = previousSelectedFeatures.current.filter(
      (psf) => !selectedFeatures.some((sf) => psf.getId() === sf.getId()),
    );

    // TODO: legg til funksjon på customstyle som håndterer dette
    // TODO: Obs, rekkefølge har noe å si her, første den treffer tar prioritet
    for (const feature of deselectedFeatures) {
      const featureId = feature.getId() as string;
      if (archivedFeatureIds.includes(featureId) || savedArchivedFeatureIds.includes(featureId)) {
        feature.setStyle(getArchiveLayerStyle(feature));
      } else if (
        sammenslaaingOverlappingFeatureIds.includes(featureId) ||
        savedSammenslaaingOverlappingFeatureIds.includes(featureId)
      ) {
        feature.setStyle(grenseStyles.sammenslaaingOverlapping);
      } else if (sammenslaaingFeatureIds.includes(featureId) || savedSammenslaaingFeatureIds.includes(featureId)) {
        feature.setStyle(grenseStyles.sammenslaaing);
      } else if (dirtyFeatureIds.includes(featureId) || savedDirtyFeatureIds.includes(featureId)) {
        feature.setStyle(grenseStyles.dirty);
      } else {
        feature.setStyle();
      }
    }

    previousSelectedFeatures.current = selectedFeatures;
  }, [
    dirtyFeatureIds,
    selectedFeatures,
    archivedFeatureIds,
    savedDirtyFeatureIds,
    savedArchivedFeatureIds,
    savedSammenslaaingFeatureIds,
    savedSammenslaaingOverlappingFeatureIds,
    sammenslaaingOverlappingFeatureIds,
    sammenslaaingFeatureIds,
  ]);

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
      renderSavedDirtyStyles();
      renderSavedArchivedStyles();
      renderSavedSammenslaaingStyles();
      renderSavedSammenslaaingOverlappingStyles();

      for (const featureId of featureIds) {
        if (
          !savedArchivedFeatureIds.includes(featureId) &&
          !savedDirtyFeatureIds.includes(featureId) &&
          !savedSammenslaaingFeatureIds.includes(featureId) &&
          !savedSammenslaaingOverlappingFeatureIds.includes(featureId)
        ) {
          setFeatureStyle(featureId, grenseStyles.edit);
        }
      }
      removeDirtyStyles(featureIds);
      removeArchivedStyles(featureIds);
      removeSammenslaaingStyles(featureIds);
      removeSammenslaaingOverlappingStyles(featureIds);
    },
    [
      removeArchivedStyles,
      removeDirtyStyles,
      removeSammenslaaingOverlappingStyles,
      removeSammenslaaingStyles,
      renderSavedArchivedStyles,
      renderSavedDirtyStyles,
      renderSavedSammenslaaingOverlappingStyles,
      renderSavedSammenslaaingStyles,
      savedArchivedFeatureIds,
      savedDirtyFeatureIds,
      savedSammenslaaingFeatureIds,
      savedSammenslaaingOverlappingFeatureIds,
    ],
  );

  useEffect(() => {
    const dirtyHistoryTypes = ["grense", "metadata", "grensetilhorighetendring", "nygrense"];

    // Når vi lagrer blir history entries tømt, så vi lagrer stilene som er satt
    if (history.entries.length === 0) {
      if (history.hasPreviouslySavedHistory) {
        if (dirtyFeatureIds.length !== 0) saveDirtyStyles();
        if (archivedFeatureIds.length !== 0) saveArchivedStyles();
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
    if (dirtyFeatureIds.length === dirtyFeatures.length && archivedFeatureIds.length === archivedFeatures.length) {
      return;
    }

    undoFeatureStyles(editFeatures);
    setDirtyStyles(dirtyFeatures);
    setArchivedStyles(archivedFeatures);
    // TODO: sammenslaaing skal egentlig være her også, men den lagres umiddelbart og kan uansett ikke angres
  }, [
    dirtyFeatureIds.length,
    history.entries,
    history.index,
    history.hasPreviouslySavedHistory,
    saveDirtyStyles,
    setDirtyStyles,
    archivedFeatureIds.length,
    saveArchivedStyles,
    setArchivedStyles,
    archivedFeatureIds,
    savedArchivedFeatureIds,
    dirtyFeatureIds,
    savedDirtyFeatureIds,
    setSammenslaaingStyles,
    history,
    setSammenslaaingOverlappingStyles,
    savedSammenslaaingFeatureIds,
    savedSammenslaaingOverlappingFeatureIds,
    undoFeatureStyles,
  ]);

  const clearFeatureStyles = () => {
    clearDirtyStyles();
    clearArchivedStyles();
    clearSammenslaaingStyles();
    clearSammenslaaingOverlappingStyles();
  };

  const featureIsArchived = (feature: FeatureLike) => {
    const featureId = feature.getId() as string;
    if (featureId) {
      return archivedFeatureIds.includes(featureId as string) || savedArchivedFeatureIds.includes(featureId as string);
    }
    return false;
  };

  const value = {
    selectFeatures,
    selectPointOnFeature,
    selectedFeatures,
    selectedPoint,
    clearSelection,

    addDirtyStyles,
    setAndSaveDirtyStyles,

    addArchivedStyles,
    setAndSaveArchivedStyles,
    featureIsArchived,

    setAndSaveSammenslaaingStyles,
    setAndSaveSammenslaaingOverlappingStyles,
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
