import { getArchiveInndelingEntries, getChangesForArchiveInndelingEntry } from "contexts/HistoryContext/history-utils";
import { HistoryChange, HistoryContextValue, HistoryEntry } from "contexts/HistoryContext/types";
import { archivedSource, editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { FeatureProperties, UtkastResponse } from "types/api";
import { removeNil } from "utils/list-utils";
import { addFeaturesToSource, getRepresentasjonspunktId, removeFeaturesFromSourceByIds } from "utils/map/source";
import { getLineStringsForOmraadeFromSource } from "../OverlayPanels/FlatedataPanel/flate-highlight-utils";

type ArchiveFeaturesOptions = {
  addArchivedStyles: (featureIds: string[]) => void;
  addHistoryEntry?: HistoryContextValue["addHistoryEntry"];
};

export const archiveFeatures = (features: Feature<LineString>[], options: ArchiveFeaturesOptions) => {
  const oldPropertiesMap = features.reduce(
    (accumulator, feature) => {
      const id = feature.getId()?.toString();
      if (id != null) {
        accumulator[id] = feature.getProperties() as FeatureProperties;
      }
      return accumulator;
    },
    {} as Record<string, FeatureProperties>,
  );
  const featureIds = Object.keys(oldPropertiesMap);

  for (const feature of features) {
    const featureId = feature.getId()?.toString();
    if (featureId != null) {
      feature.setProperties({
        ...oldPropertiesMap[featureId],
        shouldArchive: true,
      } as FeatureProperties);
    }
  }

  options.addArchivedStyles(featureIds);
  removeFeaturesFromSourceByIds("edit", featureIds);
  addFeaturesToSource("archived", features);

  if (options.addHistoryEntry != null) {
    const changes: HistoryChange<FeatureProperties>[] = removeNil(
      features.map((feature) => {
        const id = feature.getId()?.toString();
        if (id != null) {
          return {
            id,
            from: oldPropertiesMap[id],
            to: feature.getProperties() as FeatureProperties,
          };
        }
      }),
    );
    options.addHistoryEntry({ type: "grensearkivering", changes });
  }
};

export const archiveFeaturesForInndeling = (inndelingId: string) => {
  const linestrings = getLineStringsForOmraadeFromSource("BOPLIKTOMRAADE", inndelingId, ["edit"]);
  const representasjonspunkt = editSource.getFeatureById(getRepresentasjonspunktId(inndelingId));
  const features = [...linestrings, ...removeNil([representasjonspunkt])];

  for (const feature of features) {
    feature.set("shouldArchive", true);
  }

  const featureIds = removeNil(features.map((feature) => feature.getId()?.toString()));
  removeFeaturesFromSourceByIds("edit", featureIds);
  addFeaturesToSource("archived", features);
};

export const unarchiveFeaturesForInndeling = (inndelingId: string) => {
  const linestrings = getLineStringsForOmraadeFromSource("BOPLIKTOMRAADE", inndelingId, ["archived"]);
  const representasjonspunkt = archivedSource.getFeatureById(getRepresentasjonspunktId(inndelingId));
  const features = [...linestrings, ...removeNil([representasjonspunkt])];

  for (const feature of features) {
    feature.set("shouldArchive", false);
  }

  const featureIds = removeNil(features.map((f) => f.getId()?.toString()));
  removeFeaturesFromSourceByIds("archived", featureIds);
  addFeaturesToSource("edit", features);
};

export const inndelingIsArchived = (inndelingId: string, utkast: UtkastResponse, historyEntries: HistoryEntry[]) => {
  const isArchivedInUtkast = utkast?.operasjoner.archiveInndelingEndringer?.some(
    (operation) => operation.identifikator.lokalId === inndelingId,
  );
  const isArchivedInHistory = getArchiveInndelingEntries(historyEntries).some(
    (entry) => getChangesForArchiveInndelingEntry(entry).id === inndelingId,
  );

  return isArchivedInUtkast === true || isArchivedInHistory === true;
};
