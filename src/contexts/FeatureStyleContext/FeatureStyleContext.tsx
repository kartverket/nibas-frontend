import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { FeatureStyleContextValue, SelectedFeatures } from "./types";
import { useSelectStyles } from "./useSelectStyles";
import { getArchiveLayerStyle, grenseStyles, setFeatureStyle } from "utils/map/layerStyles";
import Feature, { FeatureLike } from "ol/Feature";
import useCustomStyles from "./useCustomStyles";
import { Coordinate } from "ol/coordinate";
import { Geometry } from "ol/geom";
import { archivedSource } from "hooks/layers/constants";
import { HistoryEntry, HistoryTypeValues } from "contexts/HistoryContext/types";

export const FeatureStyleContext = createContext<FeatureStyleContextValue | undefined>(undefined);

export const FeatureStyleProvider = ({ children }: { children: React.ReactNode }) => {
  const { history } = useHistory();
  const { selectedPoint, selectFeatures, selectedFeatures, selectPointOnFeature, removeSelection, clearSelectedPoint } =
    useSelectStyles();

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

  // Når en feature ikke er valgt lengre må vi avgjøre hvilken stil den skal ha
  const clearSelection = () => {
    const deselectedFeatures = removeSelection();
    for (const feature of deselectedFeatures) {
      const featureId = feature.getId() as string;

      // Dersom featuren har en aktiv stil faller vi tilbake til den
      const matchingCustomStyle = customStyles.find((customStyle) => customStyle.customFeatureIds.includes(featureId));

      // Dersom featuren ikke har en aktiv stil faller vi tilbake til den lagrede stilen
      const matchingSavedCustomStyle = customStyles.find((customStyle) =>
        customStyle.savedCustomFeatureIds.includes(featureId),
      );

      if (matchingCustomStyle) {
        feature.setStyle(matchingCustomStyle.customStyle);
      } else if (matchingSavedCustomStyle) {
        feature.setStyle(matchingSavedCustomStyle.customStyle);
      } else {
        feature.setStyle();
      }
    }
  };

  const clearAndSelectPointOnFeature = (coordinate: Coordinate, features: SelectedFeatures) => {
    clearAndSelectFeatures(features);
    selectPointOnFeature(coordinate);
  };

  const clearAndSelectFeatures = (features: SelectedFeatures) => {
    clearSelection();
    selectFeatures(features);
  };

  const getFeatureIdsFromEntries = (accumulator: string[][], entry: HistoryEntry) => {
    const featureIds: string[] = [];
    entry.changes.forEach((change) => {
      if (change.to && !accumulator.some((value) => value.includes(change.id))) {
        featureIds.push(change.id);
      }

      //change.id har den gamle grensens ID, vi trenger de to nye grensene!
      if (entry.type === "grensedeling") {
        const changesTo = change.to as Feature<Geometry>[];
        const idsToAppend = changesTo?.map((feature) => feature.getId() as string);
        if (idsToAppend) featureIds.push(...idsToAppend);
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

      if (featureIds.length > 0) {
        for (const customStyle of customStyles) {
          customStyle.renderSavedCustomStyles();
          customStyle.removeCustomStyles(featureIds);
        }
      }
    },
    [customStyles],
  );

  useEffect(() => {
    const dirtyHistoryTypes: HistoryTypeValues[] = [
      "grense",
      "property",
      "grensetilhorighetendring",
      "nygrense",
      "grensedeling",
    ];

    // Når vi lagrer blir history entries tømt, så vi lagrer stilene som er satt
    if (history.entries.length === 0) {
      for (const customStyle of customStyles) {
        if (customStyle.customFeatureIds.length !== 0) customStyle.saveCustomStyles();
      }
      // Forhindre uendelig løkke når history er tom
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

    const archivedFeatures = archivedSource.getFeatures().map((f) => f.getId() as string);

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
  }, [archivedStyleFunctions, customStyles, dirtyStyleFunctions, history, undoFeatureStyles]);

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
        archivedStyleFunctions.savedCustomFeatureIds.includes(featureId)
      );
    }
    return false;
  };

  const value = {
    selectFeatures: clearAndSelectFeatures,
    selectPointOnFeature: clearAndSelectPointOnFeature,
    selectedFeatures,
    selectedPoint,
    clearSelection,
    clearSelectedPoint,

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
