import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { FeatureStyleContextValue } from "./types";
import { useSelectStyles } from "./useSelectStyles";
import { getArchiveLayerStyle, grenseStyles, setFeatureStyle } from "utils/map/layerStyles";
import Feature, { FeatureLike } from "ol/Feature";
import useCustomStyles from "./useCustomStyles";
import { Coordinate } from "ol/coordinate";
import { archivedSource } from "hooks/layers/constants";
import { FeatureIdWithEndpoints, getAllFeatureEndPointCoordinates } from "utils/features";
import { HistoryTypeValues } from "contexts/HistoryContext/types";
import {
  filterOnlyDeadEnds,
  getEntriesUpToIndex,
  mapAffectedFeaturesForErrorEntries,
  removeDuplicateIds,
} from "./feature-style-utils";
import { newFeatureOnlyExistsAfterIndex, getChangeIds } from "contexts/HistoryContext/history-utils";
import { LineString } from "ol/geom";

export const FeatureStyleContext = createContext<FeatureStyleContextValue | undefined>(undefined);

export const FeatureStyleProvider = ({ children }: { children: React.ReactNode }) => {
  const { history } = useHistory();
  const {
    selectedPoint,
    selectFeatures: selectFeaturesInternal,
    selectedFeatures,
    selectPointOnFeature: selectPointOnFeatureInternal,
    resetSelection,
    clearSelectedPoint,
    renderSelectStyles,
    addToSelection,
    isSelectedFeature,
    removeFromSelection: removeFromSelectionInternal,
  } = useSelectStyles();

  const sammenslaaingOverlappingStyleFunctions = useCustomStyles(grenseStyles.sammenslaaingOverlapping);
  const sammenslaaingStyleFunctions = useCustomStyles(grenseStyles.sammenslaaing);
  const archivedStyleFunctions = useCustomStyles(getArchiveLayerStyle);
  const dirtyStyleFunctions = useCustomStyles(grenseStyles.dirty);
  const errorStyleFunctions = useCustomStyles(grenseStyles.error);

  // OBS! Rekkefølgen avgjør prioriteten til stilene, høyest i listen er høyest prioritet.
  const customStyles = useMemo(
    () => [
      sammenslaaingOverlappingStyleFunctions,
      sammenslaaingStyleFunctions,
      archivedStyleFunctions,
      dirtyStyleFunctions,
      errorStyleFunctions,
    ],
    [
      archivedStyleFunctions,
      dirtyStyleFunctions,
      errorStyleFunctions,
      sammenslaaingOverlappingStyleFunctions,
      sammenslaaingStyleFunctions,
    ],
  );

  // Når en feature ikke er valgt lengre må vi avgjøre hvilken stil den skal ha
  const setDeselectedStyle = (feature: Feature<LineString>) => {
    const featureId = feature.getId()?.toString();
    if (featureId !== undefined) {
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

  const clearSelection = () => {
    const deselectedFeatures = resetSelection();
    for (const feature of deselectedFeatures) {
      setDeselectedStyle(feature);
    }
  };

  const removeFromSelection = (feature: Feature<LineString>) => {
    removeFromSelectionInternal(feature);
    setDeselectedStyle(feature);
  };

  const selectFeatures = (features: Feature<LineString>[]) => {
    const deselectedFeatures = selectedFeatures.filter((sf) => !features.some((f) => sf.getId() === f.getId()));
    for (const feature of deselectedFeatures) {
      setDeselectedStyle(feature);
    }
    selectFeaturesInternal(features);
  };

  const selectPointOnFeature = (coordinate: Coordinate, features: Feature<LineString>[]) => {
    selectFeatures(features);
    selectPointOnFeatureInternal(coordinate);
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

    const errorHistoryTypes: HistoryTypeValues[] = ["grense", "nygrense", "grensearkivering"];

    // Når vi lagrer blir history entries tømt, så vi lagrer stilene som er satt
    if (history.entries.length === 0) {
      for (const customStyle of customStyles) {
        if (customStyle.customFeatureIds.length !== 0) customStyle.saveCustomStyles();
      }
      // Forhindre uendelig løkke når history er tom
      return;
    }

    const allFeatureIds = removeDuplicateIds(history.entries.flat().flatMap(getChangeIds));
    // Finn IDer som er med i historikken etter index, men ikke før
    const featureIdsToIgnore = allFeatureIds.filter((id) => newFeatureOnlyExistsAfterIndex(id, history));

    const featureEndpointsToCheck = getAllFeatureEndPointCoordinates(["matrikkel", "archived"]).filter(
      (featureEndpoint) => featureEndpoint != null && !featureIdsToIgnore.includes(featureEndpoint.featureId),
    ) as FeatureIdWithEndpoints[];

    const archivedFeatures = removeDuplicateIds(archivedSource.getFeatures().map((f) => f.getId()?.toString() ?? ""));
    const errorFeatures = removeDuplicateIds(
      getEntriesUpToIndex(history, (entry) => errorHistoryTypes.includes(entry.type))
        .flatMap(mapAffectedFeaturesForErrorEntries)
        .filter(filterOnlyDeadEnds(featureEndpointsToCheck, archivedFeatures))
        .map((feature) => feature.getId()?.toString() ?? ""),
    );

    // Entries før index skal fargelegges basert på endringen som er gjort
    const dirtyFeatures = removeDuplicateIds(
      getEntriesUpToIndex(history, (entry) => dirtyHistoryTypes.includes(entry.type)).flatMap(getChangeIds),
    ).filter((id) => !errorFeatures.includes(id));

    // For å forhindre uendelig løkke
    if (
      dirtyStyleFunctions.customFeatureIds.length === dirtyFeatures.length &&
      archivedStyleFunctions.customFeatureIds.length === archivedFeatures.length &&
      errorStyleFunctions.customFeatureIds.length === errorFeatures.length
    ) {
      return;
    }

    // Først må vi fjerne alle satte styles, slik at vi ikke må beregne oss til en differense
    const allStyledFeatures = dirtyStyleFunctions.customFeatureIds
      .concat(archivedStyleFunctions.customFeatureIds)
      .concat(errorStyleFunctions.customFeatureIds);

    undoFeatureStyles(allStyledFeatures);

    // Obs: sammenslåing skal egentlig være her også, men den lagres umiddelbart og kan uansett ikke angres
    dirtyStyleFunctions.setCustomStyles(dirtyFeatures);
    archivedStyleFunctions.setCustomStyles(archivedFeatures);
    errorStyleFunctions.setCustomStyles(errorFeatures);
    renderSelectStyles(selectedFeatures);
  }, [
    archivedStyleFunctions,
    customStyles,
    dirtyStyleFunctions,
    errorStyleFunctions,
    history,
    renderSelectStyles,
    selectedFeatures,
    undoFeatureStyles,
  ]);

  const clearFeatureStyles = () => {
    for (const customStyle of customStyles) {
      customStyle.clearCustomStyles();
    }
  };

  const featureIsArchived = (feature: FeatureLike) => {
    const featureId = feature.getId()?.toString();
    if (featureId != null) {
      return (
        archivedStyleFunctions.customFeatureIds.includes(featureId) ||
        archivedStyleFunctions.savedCustomFeatureIds.includes(featureId)
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
    clearSelectedPoint,
    addToSelection,
    removeFromSelection,
    isSelectedFeature,

    addDirtyStyles: dirtyStyleFunctions.addCustomStyles,
    setAndSaveDirtyStyles: dirtyStyleFunctions.setAndSaveCustomStyles,

    addErrorStyles: errorStyleFunctions.addCustomStyles,
    setAndSaveErrorStyles: errorStyleFunctions.setAndSaveCustomStyles,

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
