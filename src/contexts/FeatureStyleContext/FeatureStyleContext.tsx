import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import useDirtyStyles from "./useDirtyStyles";
import { HistoryEntry, useHistory } from "contexts/HistoryContext";
import { FeatureStyleContextValue } from "./types";
import { useSelectStyles } from "./useSelectStyles";
import { getArchiveLayerStyle, grenseStyles, setFeatureStyle } from "utils/map/layerStyles";
import useArchiveStyles from "./useArchiveStyles";
import { FeatureLike } from "ol/Feature";

export const FeatureStyleContext = createContext<FeatureStyleContextValue | undefined>(undefined);

export const FeatureStyleProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedPoint, selectFeatures, selectedFeatures, selectPointOnFeature, clearSelection } = useSelectStyles();
  const {
    dirtyFeatureIds,
    setDirtyFeatures,
    clearDirtyStyles,
    saveDirtyFeatureIds,
    savedDirtyFeatureIds,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
  } = useDirtyStyles();
  const {
    archivedFeatureIds,
    setArchivedFeatures,
    clearArchivedStyles,
    saveArchivedFeatureIds,
    savedArchivedFeatureIds,
    setAndSaveUtkastArchivedFeatures,
  } = useArchiveStyles();
  const { history } = useHistory();
  const previousSelectedFeatures = useRef(selectedFeatures);

  // Når en feature ikke er valgt lengre må vi avgjøre hvilken stil den skal ha
  useEffect(() => {
    const deselectedFeatures = previousSelectedFeatures.current.filter(
      (psf) => !selectedFeatures.some((sf) => psf.getId() === sf.getId()),
    );

    for (const feature of deselectedFeatures) {
      if (
        dirtyFeatureIds.some((id) => id === feature.getId()) ||
        savedDirtyFeatureIds.some((id) => id === feature.getId())
      ) {
        feature.setStyle(grenseStyles.dirty);
      } else if (
        archivedFeatureIds.some((id) => id === feature.getId()) ||
        savedArchivedFeatureIds.some((id) => id === feature.getId())
      ) {
        feature.setStyle(getArchiveLayerStyle(feature));
      } else {
        feature.setStyle();
      }
    }

    previousSelectedFeatures.current = selectedFeatures;
  }, [dirtyFeatureIds, selectedFeatures, archivedFeatureIds, savedDirtyFeatureIds, savedArchivedFeatureIds]);

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

  const resetFeaturesToEditStyle = useCallback(
    (featureIds: string[]) => {
      for (const featureId of featureIds) {
        if (!savedArchivedFeatureIds.includes(featureId) && !savedDirtyFeatureIds.includes(featureId)) {
          setFeatureStyle(featureId, grenseStyles.edit);
        }
      }
      setDirtyFeatures(dirtyFeatureIds.filter((dfi) => !featureIds.includes(dfi)));
      setArchivedFeatures(archivedFeatureIds.filter((afi) => !featureIds.includes(afi)));
    },
    [
      archivedFeatureIds,
      dirtyFeatureIds,
      savedArchivedFeatureIds,
      savedDirtyFeatureIds,
      setArchivedFeatures,
      setDirtyFeatures,
    ],
  );

  useEffect(() => {
    const dirtyHistoryTypes = ["grense", "metadata", "grensetilhorighetendring", "nygrense"];

    // Når vi lagrer blir history entries tømt, så vi lagrer stilene som er satt
    if (history.entries.length === 0) {
      if (history.hasPreviouslySavedHistory) {
        if (dirtyFeatureIds.length !== 0) saveDirtyFeatureIds();
        if (archivedFeatureIds.length !== 0) saveArchivedFeatureIds();
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

    resetFeaturesToEditStyle(editFeatures);
    setDirtyFeatures(dirtyFeatures);
    setArchivedFeatures(archivedFeatures);
  }, [
    dirtyFeatureIds.length,
    history.entries,
    history.index,
    history.hasPreviouslySavedHistory,
    saveDirtyFeatureIds,
    setDirtyFeatures,
    archivedFeatureIds.length,
    saveArchivedFeatureIds,
    setArchivedFeatures,
    archivedFeatureIds,
    savedArchivedFeatureIds,
    dirtyFeatureIds,
    savedDirtyFeatureIds,
    resetFeaturesToEditStyle,
  ]);

  const clearFeatureStyles = () => {
    clearDirtyStyles();
    clearArchivedStyles();
  };

  const featureIsArchived = (feature: FeatureLike) => {
    const featureId = feature.getId();
    if (featureId) {
      return archivedFeatureIds.includes(featureId as string) || savedArchivedFeatureIds.includes(featureId as string);
    }
    return false;
  };

  const value = {
    selectedPoint,
    selectedFeatures,
    selectFeatures,
    clearSelection,
    featureIsArchived,
    selectPointOnFeature,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
    clearFeatureStyles,
    setArchivedFeatures,
    setAndSaveUtkastArchivedFeatures,
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
