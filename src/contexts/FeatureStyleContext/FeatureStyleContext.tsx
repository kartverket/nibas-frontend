import React, { createContext, useContext, useEffect } from "react";
import useDirtyStyles from "./useDirtyStyles";
import { useHistory } from "contexts/HistoryContext";
import { getFeatureIdsFromEntries } from "./utils";
import { FeatureStyleContextValue } from "./types";

export const FeatureStyleContext = createContext<
  FeatureStyleContextValue | undefined
>(undefined);

export const FeatureStyleProvider: React.FC = ({ children }) => {
  const {
    dirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
    saveDirtyFeatureIds,
    clearSavedDirtyFeatureIds,
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
  } = useDirtyStyles();

  const { history } = useHistory();

  useEffect(() => {
    if (history.entries.length === 0) {
      if (history.hasPreviouslySavedHistory && dirtyFeatureIds.length !== 0) {
        saveDirtyFeatureIds();
      }
      // Hvis det ikke er for å lagre, så er det for å forhindre uendelig løkke
      return;
    }

    const historyFeatures = history.entries
      .filter((entry) => entry.type === "grense" || entry.type === "metadata")
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
  }, [
    dirtyFeatureIds.length,
    history.entries,
    history.index,
    history.hasPreviouslySavedHistory,
    saveDirtyFeatureIds,
    setDirtyFeatures,
    setEditFeatures,
  ]);

  const value = {
    setAndSaveUtkastFeatures,
    setAndSaveSammenslaaingsFeatures,
    dirtyFeatureIds,
    clearDirtyStyles: clearSavedDirtyFeatureIds,
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
      "useFeatureStyle must be used within a FeatureStyleContext"
    );
  }

  return context;
};
