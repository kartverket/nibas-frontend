import LineString from "ol/geom/LineString";
import {
  HistoryDirection,
  GrenseEntry,
  GrenseTilhorighetEntry,
  HistoryChange,
  MinimalGrense,
  NyGrenseEntry,
  PropertyEntry,
  GrenseArkiveringsEntry,
  HistoryEntry,
  HistoryState,
  GrenseDelingEntry,
  NyGrense,
  StemmekretsEntry,
  GrunnkretsEntry,
  KretsdelingEntry,
} from "./types";
import { archivedSource, editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { setDefaultFeatureProperties } from "utils/features";
import { FeatureProperties, KontekstEgenskaper } from "types/api";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { removeNil } from "utils/list-utils";
import { Geometry } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { getEntriesUpToIndex, removeDuplicateIds } from "contexts/FeatureStyleContext/feature-style-utils";

const getFeatureFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
  const existingFeature = getFeatureIfExists(change.id);
  if (!existingFeature && direction === "to") {
    const newFeature = new Feature({
      geometry: new LineString(change[direction].coordinates),
    });
    newFeature.setId(change.id);
    setDefaultFeatureProperties(newFeature, change.to.type);
    editSource.addFeature(newFeature);
    return newFeature;
  }

  return existingFeature;
};

const getFeatureIfExists = (featureId: string) => {
  return editSource.getFeatureById(featureId);
};

const setCoordinatesFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
  const feature = getFeatureFromChange(change, direction);
  if (!feature) return;

  const lineString = feature.getGeometry() as LineString;
  const coordinates = change[direction].coordinates as Coordinate[] | undefined;

  if (direction === "from" && !coordinates) {
    editSource.removeFeature(feature);
  }
  if (!coordinates) return;
  lineString.setCoordinates(coordinates);
};

export const setFeatureCoordinatesForEntry = (entry: GrenseEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => setCoordinatesFromChange(change, direction));

  return document.dispatchEvent(
    new CustomEvent(direction === "from" ? "grenseUndo" : "grenseRedo", {
      detail: { entry },
    }),
  );
};

const setPropertiesFromChange = (change: HistoryChange<FeatureProperties>, direction: HistoryDirection) => {
  const feature = getFeatureIfExists(change.id);
  if (!feature) return;

  const properties = change[direction] as FeatureProperties | undefined;
  if (!properties) return;
  feature.setProperties(properties);
};

const createDummyGrensedelingEntry = (delteFeatures: Feature[], newFeatures: Feature[]): GrenseDelingEntry => ({
  type: "grensedeling",
  changes: [
    {
      id: "temp-ny-grense-grensedeling",
      to: newFeatures,
      from: delteFeatures,
    },
  ],
});

export const handleNyGrense = (entry: NyGrenseEntry, direction: HistoryDirection) => {
  const delteFeatures = removeNil(entry.changes.flatMap((e) => e.from.grensedeling));
  const newFeatures = removeNil(entry.changes.flatMap((e) => e.to.grensedeling));
  if (delteFeatures.length > 0) {
    handleGrensedeling(createDummyGrensedelingEntry(delteFeatures, newFeatures), direction);
  }
  if (direction === "to") {
    redoGrensedeling(delteFeatures, newFeatures);
  } else if (direction === "from") {
    undoGrensedeling(delteFeatures, newFeatures);
  }

  // Vil ikke ha med grensedeling i feature properties, da det skaper problemer ved serialisering av utkast.
  // Sender derfor med en representasjon uten grensedeling.
  const serializableEntryCopy = {
    changes: entry.changes.map((e) => ({
      from: {
        coordinates: e.from.coordinates,
        shouldArchive: e.from.shouldArchive,
        inndelingerKontekst: e.from.inndelingerKontekst,
        kontekstEgenskaper: e.from.kontekstEgenskaper,
        metadata: e.from.metadata,
        srid: e.from.srid,
        type: e.from.type,
        version: e.from.version,
      },
      to: {
        coordinates: e.to.coordinates,
        shouldArchive: e.to.shouldArchive,
        inndelingerKontekst: e.to.inndelingerKontekst,
        kontekstEgenskaper: e.to.kontekstEgenskaper,
        metadata: e.to.metadata,
        srid: e.to.srid,
        type: e.to.type,
        version: e.to.version,
      },
      id: e.id,
    })),
    type: entry.type,
  };
  setFeatureCoordinatesAndPropertiesForEntry(serializableEntryCopy, direction);
};

export const handleGrensedeling = (entry: GrenseDelingEntry, direction: HistoryDirection) => {
  const deltFeature = entry.changes.flatMap((change) => change.from);
  const newFeaturesFromDeling = entry.changes.flatMap((change) => change.to);
  if (direction === "to") {
    redoGrensedeling(deltFeature, newFeaturesFromDeling);
    return;
  }

  undoGrensedeling(deltFeature, newFeaturesFromDeling);
};

export const setFeaturePropertiesForEntry = (entry: PropertyEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => setPropertiesFromChange(change, direction));
};

export const setFeatureCoordinatesAndPropertiesForEntry = (entry: NyGrenseEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change: HistoryChange<FeatureProperties & MinimalGrense>) => {
    setPropertiesFromChange(change, direction);
    setCoordinatesFromChange(change, direction);
  });
};

export const setKontekstEgenskaperForEntry = (entry: GrenseTilhorighetEntry, direction: HistoryDirection) => {
  entry.changes.forEach((change) => {
    const feature = getFeatureIfExists(change.id);
    if (!feature) return;

    const kontekstEgenskaper = change[direction] as KontekstEgenskaper[] | undefined;

    if (!kontekstEgenskaper) return;

    feature.setProperties({ ...feature.getProperties(), kontekstEgenskaper });
  });
};

export const redoArchiving = (entry: GrenseArkiveringsEntry) => {
  const features = removeNil(entry.changes.map((c) => editSource.getFeatureById(c.id)));
  const featureIds = entry.changes.map((c) => c.id);

  addFeaturesToSource("archived", features);
  removeFeaturesFromSourceByIds("edit", featureIds);

  return document.dispatchEvent(
    new CustomEvent("grensearkiveringRedo", {
      detail: { entry },
    }),
  );
};

export const undoArchving = (entry: GrenseArkiveringsEntry) => {
  const features = removeNil(entry.changes.map((c) => archivedSource.getFeatureById(c.id)));
  const featureIds = entry.changes.map((c) => c.id);

  for (const feature of features) {
    feature.set("shouldArchive", false);
  }

  addFeaturesToSource("edit", features);
  removeFeaturesFromSourceByIds("archived", featureIds);

  return document.dispatchEvent(
    new CustomEvent("grensearkiveringUndo", {
      detail: { entry },
    }),
  );
};

export const redoGrensedeling = (delteFeatures: Feature[], newFeaturesFromsDeling: Feature[]) => {
  delteFeatures.forEach((deltFeature) => {
    const properties = deltFeature.getProperties() as FeatureProperties;
    deltFeature.setProperties({ ...properties, shouldArchive: true });
    const deltFeatureId = deltFeature.getId()?.toString();
    if (deltFeatureId == null) return;
    removeFeaturesFromSourceByIds("edit", [deltFeatureId]);

    // Hvis featuren som ble delt er en eksisterende feature vil vi vise den som arkivert
    if (!isTempFeatureId(deltFeatureId)) {
      addFeaturesToSource("archived", [deltFeature]);
    }
  });
  addFeaturesToSource("edit", newFeaturesFromsDeling);
};

export const undoGrensedeling = (delteFeatures: Feature[], newFeaturesFromsDeling: Feature[]) => {
  delteFeatures.forEach((deltFeature) => {
    const properties = deltFeature.getProperties() as FeatureProperties;
    deltFeature.setProperties({ ...properties, shouldArchive: false });
    addFeaturesToSource("edit", [deltFeature]);

    const deltFeatureId = deltFeature.getId()?.toString();
    if (deltFeatureId == null) return;

    // Om featuren som ble splittet ikke var en ny grense vises den som arkivert, vi må derfor fjerne den fra archived layer
    if (!isTempFeatureId(deltFeatureId)) {
      removeFeaturesFromSourceByIds("archived", [deltFeatureId]);
    }
  });

  const idsToRemove = removeNil(newFeaturesFromsDeling.map((feature) => feature.getId()?.toString()));
  removeFeaturesFromSourceByIds("edit", idsToRemove);
};

export const getChangeIds = (historyEntry: HistoryEntry): string[] => {
  const changedFeatureIds: string[] = [];
  historyEntry.changes.forEach((change) => {
    if (change.to == null) return;

    if (historyEntry.type === "grensedeling") {
      const changesTo = change.to as Feature<Geometry>[];
      const idsToAppend = removeNil(changesTo.map((feature) => feature.getId()?.toString()).filter(Boolean));
      changedFeatureIds.push(...idsToAppend);
    } else if (historyEntry.type === "nygrense") {
      const nyGrenseChange = change as HistoryChange<NyGrense>;

      if (
        nyGrenseChange.from.grensedeling != null &&
        nyGrenseChange.to.grensedeling != null &&
        nyGrenseChange.from.grensedeling.length > 0
      ) {
        // NyGrense har ikke den gamle IDen for grensedeling satt direkte på en egenskap i endringen (change.id)
        // på samme måte som grensedeling, må derfor hente fra changeFrom også.
        const idsToAppend = [...nyGrenseChange.from.grensedeling, ...nyGrenseChange.to.grensedeling]
          .flatMap((feature) => feature.getId()?.toString() ?? "")
          .filter(Boolean);
        changedFeatureIds.push(...removeNil(idsToAppend));
      }
    }
    changedFeatureIds.push(change.id);
  });
  return removeDuplicateIds(changedFeatureIds);
};
/**
 * Hjelpefunksjon for å lete etter featureIds til nye grenser som kun eksisterer etter nåværende indexposisjon
 * @param featureId ID å sjekke mot
 * @param history HistoryState
 * @returns true dersom IDen ikke finnes i nåværende delmengde av history, ellers false.
 */

export const newFeatureOnlyExistsAfterIndex = (featureId: string, history: HistoryState) => {
  const idsUpToIndex = getEntriesUpToIndex(history).flatMap(getChangeIds);

  return !idsUpToIndex.includes(featureId) && isTempFeatureId(featureId);
};

// Filter er dum, så selv om man hadde bruke en type-guard inne i filter-funksjonen så hadde den ikke forstått
// at listene kun ville inneholdt den korrekte entry-typen. Men tenker det er greit siden det her er veldig
// tydelig hva typen skulle vært og kan derfor caste for å spisse typen. I praksis fungerer disse som en kombinasjon
// av et filter og en typeguard.
export const getGrenseDelingEntries = (entries: HistoryEntry[]): GrenseDelingEntry[] => {
  return entries.filter((entry) => entry.type === "grensedeling") as GrenseDelingEntry[];
};

export const getStemmekretsMetadataEntries = (entries: HistoryEntry[]): StemmekretsEntry[] => {
  return entries.filter((entry) => entry.type === "stemmekrets") as StemmekretsEntry[];
};

export const getGrunnkretsMetadataEntries = (entries: HistoryEntry[]): GrunnkretsEntry[] => {
  return entries.filter((entry) => entry.type === "grunnkrets") as GrunnkretsEntry[];
};

export const getKretsDelingEntries = (entries: HistoryEntry[]): KretsdelingEntry[] => {
  return entries.filter((entry) => entry.type === "kretsdelingendring") as KretsdelingEntry[];
};

export const getGrenseTilhorighetEntries = (entries: HistoryEntry[]): GrenseTilhorighetEntry[] => {
  return entries.filter((entry) => entry.type === "grensetilhorighetendring") as GrenseTilhorighetEntry[];
};
