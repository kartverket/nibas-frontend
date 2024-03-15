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
import {
  FeatureIdWithEndpoints,
  getAllFeatureEndPointCoordinates,
  getFeatureIfExistsInAnyLayer,
  getFeaturesConnectedToFeatureAtEndpoints,
  isFeatureDeadEnd,
} from "utils/features";
import { HistoryEntry, HistoryTypeValues } from "contexts/HistoryContext/types";
import { removeNull } from "utils/list-utils";

export const FeatureStyleContext = createContext<FeatureStyleContextValue | undefined>(undefined);

export const FeatureStyleProvider = ({ children }: { children: React.ReactNode }) => {
  const { history } = useHistory();
  const { selectedPoint, selectFeatures, selectedFeatures, selectPointOnFeature, removeSelection, clearSelectedPoint } =
    useSelectStyles();

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
  const clearSelection = () => {
    const deselectedFeatures = removeSelection();
    for (const feature of deselectedFeatures) {
      const featureId = feature.getId()?.toString();
      if (featureId == null) continue;

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
      if (change.to != null && !accumulator.some((value) => value.includes(change.id))) {
        featureIds.push(change.id);
      }

      //change.id har den gamle grensens ID, vi trenger de to nye grensene!
      if (entry.type === "grensedeling") {
        const changesTo = change.to as Feature<Geometry>[];
        const idsToAppend = removeNull(changesTo?.map((feature) => feature.getId()?.toString()));
        featureIds.push(...idsToAppend);
      }
    });
    accumulator.push(featureIds);
    return accumulator;
  };

  const getAffectedFeaturesForErrorEntries = (accumulator: Feature<Geometry>[][], entry: HistoryEntry) => {
    const changes = entry.changes;

    for (const change of changes) {
      const feature = getFeatureIfExistsInAnyLayer(change.id);

      if (!feature) continue;

      if (entry.type === "nygrense" || entry.type === "grense") {
        accumulator.push([feature]);
        continue;
      }

      if (entry.type === "grensearkivering") {
        accumulator = accumulator.concat(getFeaturesConnectedToFeatureAtEndpoints(feature));
        continue;
      }
    }

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

    const errorHistoryTypes: HistoryTypeValues[] = ["grense", "nygrense", "grensearkivering"];

    // Når vi lagrer blir history entries tømt, så vi lagrer stilene som er satt
    if (history.entries.length === 0) {
      for (const customStyle of customStyles) {
        if (customStyle.customFeatureIds.length !== 0) customStyle.saveCustomStyles();
      }
      // Forhindre uendelig løkke når history er tom
      return;
    }

    const allFeatureEndpoints = getAllFeatureEndPointCoordinates(["matrikkel", "archived"]).filter(
      (featureEndpoint) => featureEndpoint !== null,
    ) as FeatureIdWithEndpoints[];

    const archivedFeatures = archivedSource.getFeatures().map((f) => f.getId()?.toString() ?? "");

    const errorFeatures = history.entries
      .slice(0, history.index)
      .filter((entry) => errorHistoryTypes.includes(entry.type))
      .reduce(getAffectedFeaturesForErrorEntries, [])
      .flat()
      .filter((feature) => {
        const featureId = feature.getId()?.toString();
        if (featureId != null && !archivedFeatures.includes(featureId)) {
          return isFeatureDeadEnd(feature, allFeatureEndpoints);
        }

        return false;
      })
      .map((feature) => feature.getId()?.toString() ?? "");

    // Entries før index skal fargelegges basert på endringen som er gjort
    const dirtyFeatures = history.entries
      .slice(0, history.index)
      .filter((entry) => dirtyHistoryTypes.includes(entry.type))
      .reduce(getFeatureIdsFromEntries, [])
      .flatMap((id) => id)
      .filter((id) => !errorFeatures.includes(id));

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
  }, [archivedStyleFunctions, customStyles, dirtyStyleFunctions, errorStyleFunctions, history, undoFeatureStyles]);

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
    selectFeatures: clearAndSelectFeatures,
    selectPointOnFeature: clearAndSelectPointOnFeature,
    selectedFeatures,
    selectedPoint,
    clearSelection,
    clearSelectedPoint,

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
