import React, { createContext, useContext, useEffect, useRef } from "react";
import useDirtyStyles from "./useDirtyStyles";
import { useHistory } from "contexts/HistoryContext";
import { getFeatureIdsFromEntries } from "./utils";
import { FeatureStyleContextValue } from "./types";
import { useSelectStyles } from "./useSelectStyles";
import { getArchiveLayerStyle, grenseStyles } from "utils/map/layerStyles";
import useArchiveStyles from "./useArchiveStyles";

export const FeatureStyleContext = createContext<
  FeatureStyleContextValue | undefined
>(undefined);

export const FeatureStyleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    selectedPoint,
    selectFeatures,
    selectedFeatures,
    selectPointOnFeature,
    clearSelection,
  } = useSelectStyles();
  const {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
  } = useDirtyStyles();
  const { archivedFeatureIds, setArchivedFeatures, saveArchivedFeatureIds } =
    useArchiveStyles();
  const { history } = useHistory();
  const previousSelectedFeatures = useRef(selectedFeatures);

  // Når en feature ikke er valgt lengre må vi avgjøre hvilken stil den skal ha
  useEffect(() => {
    const deselectedFeatures = previousSelectedFeatures.current.filter(
      (psf) => !selectedFeatures.some((sf) => psf.getId() === sf.getId()),
    );

    for (const feature of deselectedFeatures) {
      if (dirtyFeatureIds.some((id) => id === feature.getId())) {
        // TODO: denne ser ikke ut til å fungere som den skal når jeg selecter og deselecter en (lagret) endret grense, den blir bare standard sort
        feature.setStyle(grenseStyles.dirty);
      } else if (archivedFeatureIds.some((id) => id === feature.getId())) {
        // TODO: denne ser ikke ut til å fungere som den skal når jeg selecter og deselecter en (lagret) arkivert grense, den blir bare standard sort
        feature.setStyle(getArchiveLayerStyle(feature));
      } else {
        feature.setStyle();
      }
    }

    previousSelectedFeatures.current = selectedFeatures;
  }, [dirtyFeatureIds, selectedFeatures, archivedFeatureIds]);

  useEffect(() => {
    if (history.entries.length === 0) {
      if (history.hasPreviouslySavedHistory && dirtyFeatureIds.length !== 0) {
        saveDirtyFeatureIds();
      }

      if (
        history.hasPreviouslySavedHistory &&
        archivedFeatureIds.length !== 0
      ) {
        saveArchivedFeatureIds();
      }
      // Hvis det ikke er for å lagre, så er det for å forhindre uendelig løkke
      return;
    }

    const historyFeatures = history.entries
      .filter((entry) => entry.type === "grense" || entry.type === "metadata")
      .reduce<string[][]>(getFeatureIdsFromEntries, []);

    const archivedFeatures = history.entries
      .filter((entry) => entry.type === "grensearkivering")
      .reduce<string[][]>(getFeatureIdsFromEntries, []);

    const editFeatures = historyFeatures
      .slice(history.index)
      .flatMap((id) => id);

    const dirtyFeatures = historyFeatures
      .slice(0, history.index)
      .flatMap((id) => id);

    // For å forhindre uendelig løkke
    if (dirtyFeatureIds.length === dirtyFeatures.length) return;

    setEditFeatures(editFeatures);
    setDirtyFeatures(dirtyFeatures);
    // TODO: hvis man åpner et utkast med en lagret arkivering så blir den farget som en endring fremfor en arkivering, er det med vilje?
    setArchivedFeatures(archivedFeatures.flatMap((id) => id));
  }, [
    dirtyFeatureIds.length,
    history.entries,
    history.index,
    history.hasPreviouslySavedHistory,
    saveDirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    archivedFeatureIds.length,
    saveArchivedFeatureIds,
    setArchivedFeatures,
  ]);

  const value = {
    selectedPoint,
    selectedFeatures,
    selectFeatures,
    clearSelection,
    selectPointOnFeature,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
    dirtyFeatureIds,
    clearDirtyStyles: clearSavedDirtyFeatureIds,
    archivedFeatureIds,
    setArchivedFeatures,
  };

  return (
    <FeatureStyleContext.Provider value={value}>
      {children}
    </FeatureStyleContext.Provider>
  );
};

export const useFeatureStyle = () => {
  const context = useContext(FeatureStyleContext);
  if (!context) {
    throw new Error(
      "useFeatureStyle must be used within a FeatureStyleContext",
    );
  }

  return context;
};
