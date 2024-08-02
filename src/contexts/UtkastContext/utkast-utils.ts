import { Feature } from "ol";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { EntityUtkastType, UtkastEntity, ResponseWithId } from "./types";
import {
  MetadataEntry,
  HistoryChange,
  HistoryState,
  HistoryTypeValues,
  KretsdelingEntry,
  StemmekretsSammenslaaingsendringEntry,
  NyGrense,
  NyGrenseDeleteEntry,
} from "contexts/HistoryContext/types";
import { archivedSource, editSource } from "hooks/layers/constants";
import {
  FeatureProperties,
  FylkeRequest,
  GrunnkretsRequest,
  KommuneRequest,
  KretsDelingEndringRequest,
  Metadata,
  NasjonRequest,
  OppdaterUtkastRequest,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
  UtkastMetadataendringer,
  UtkastOperasjoner,
  UtkastResponse,
} from "types/api";
import { featureToGeoJson } from "utils/map/geoJson";
import { getIdFromEntity } from "utils/api";
import { isTempDokrefId } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/Vedtaksinformasjon/util/vedtaksinfoHelperMethods";
import { getUniqueItems, removeNil } from "utils/list-utils";
import { isTempFeatureId, getTempFeatureId } from "pages/Kart/interactions/feature-id-utils";

const getCombinedEntity = <T extends ResponseWithId>(
  entity: T,
  utkastSlice: NonNullable<NonNullable<UtkastMetadataendringer>[EntityUtkastType]>,
) => {
  const utkastForEntity = utkastSlice[getIdFromEntity(entity)];

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

export const applyNonFeatureUtkast = <T extends NonNullable<UtkastEntity>>(
  entity: T,
  utkast: UtkastResponse,
  type: EntityUtkastType,
) => {
  const utkastSlice = utkast.operasjoner.metadataendringer?.[type];
  if (utkastSlice == null) {
    return entity;
  }

  if (Array.isArray(entity)) {
    return entity.map((e) => getCombinedEntity(e, utkastSlice));
  }

  return getCombinedEntity(entity, utkastSlice);
};

//Antas at det bare er en entry i changes
const reduceStemmekretssammenslaingsOperations = (
  operations: StemmekretsSammenslaaingsendringRequest,
  entry: StemmekretsSammenslaaingsendringEntry,
): StemmekretsSammenslaaingsendringRequest => {
  entry.changes.forEach((change) => {
    if (change.to == null) {
      return operations;
    }

    operations = change.to;
  });
  return operations;
};

const addKretsChangeToOperations = (
  operations: UtkastOperasjoner,
  entry: MetadataEntry,
  endringerKey: "grunnkretsendringer" | "stemmekretsendringer" | "kommuneendringer",
): UtkastOperasjoner => {
  for (const change of entry.changes) {
    if (change.to != null && operations.metadataendringer[endringerKey] != null) {
      operations.metadataendringer[endringerKey][change.id] = change.to;
    }
  }

  return operations;
};

export const historyToKretsdelingOperations = (kretsdelingEntries: KretsdelingEntry[]): KretsDelingEndringRequest[] => {
  const kretsdelingerMap = kretsdelingEntries
    .flatMap((entry) => entry.changes)
    .reduce((accumulator, currentValue) => ({ ...accumulator, [currentValue.id]: currentValue.to }), {});
  return Object.values(kretsdelingerMap);
};

const mergeKretsdelingOperations = (
  kretsdelingerFromUtkast: KretsDelingEndringRequest[],
  kretsdelingerFromHistory: KretsDelingEndringRequest[],
): KretsDelingEndringRequest[] => {
  const kretsIdsForKretserSplittedOnHistory = kretsdelingerFromHistory.map(
    (kretsdeling) => kretsdeling.opprinneligKrets.lokalId,
  );
  const kretdelingerInUtkastNotOverwritten = kretsdelingerFromUtkast.filter(
    (kretsdeling) => !kretsIdsForKretserSplittedOnHistory.includes(kretsdeling.opprinneligKrets.lokalId),
  );
  return [...kretdelingerInUtkastNotOverwritten, ...kretsdelingerFromHistory];
};

const reduceMetadataOperations = (utkastOperations: UtkastOperasjoner, entry: MetadataEntry) =>
  addKretsChangeToOperations(utkastOperations, entry, `${entry.type}endringer`);

export const historyToUtkastOperations = (history: HistoryState, previousUtkast?: UtkastResponse) => {
  const historyToCurrentIndex = history.entries.slice(0, history.index);

  const allKretsdelingHistoryEntries = historyToCurrentIndex.filter(
    (entry) => entry.type === "kretsdelingendring",
  ) as KretsdelingEntry[];

  const kretsdelingOperations = historyToKretsdelingOperations(allKretsdelingHistoryEntries);

  const metadataEntries: HistoryTypeValues[] = ["kommune", "stemmekrets", "grunnkrets"];

  // hent endringer på enheter og gjør endringene om til utkastoperasjoner
  const utkastOperations = (
    historyToCurrentIndex.filter((entry) => metadataEntries.includes(entry.type)) as MetadataEntry[]
  ).reduce<UtkastOperasjoner>(
    reduceMetadataOperations,
    createUtkastOperations({
      ...{
        ...previousUtkast?.operasjoner.grenseendringer,
        ...previousUtkast?.operasjoner.metadataendringer,
        stemmekretssammenslaaingsendringer: previousUtkast?.operasjoner.stemmekretsSammenslaaingsendring,
        kretsDelingEndringer: mergeKretsdelingOperations(
          previousUtkast?.operasjoner.kretsDelingEndringer ?? [],
          kretsdelingOperations,
        ),
      },
    }),
  );

  const sammenslaaingsOperations = (
    historyToCurrentIndex.filter(
      (entry) => entry.type === "stemmekretssammenslaaingsendring",
    ) as StemmekretsSammenslaaingsendringEntry[]
  ).reduce(reduceStemmekretssammenslaingsOperations, {} as StemmekretsSammenslaaingsendringRequest);

  //Antar her at det bare er en sammenslåing per utkast
  if (Object.keys(sammenslaaingsOperations).length > 0) {
    utkastOperations.stemmekretsSammenslaaingsendring = sammenslaaingsOperations;
  }

  const editedFeatureHistoryEntries: HistoryTypeValues[] = [
    "grense",
    "property",
    "grensearkivering",
    "grensetilhorighetendring",
    "nygrense",
    "grensedeling",
  ];

  const relevantHistoryEntries = historyToCurrentIndex.filter((entry) =>
    editedFeatureHistoryEntries.includes(entry.type),
  );

  // hent grenseendringer og gjør endringene om til en liste av features
  let editedFeatures: GeoJSONFeature[] = utkastOperations.grenseendringer.endredeFeatures;

  const addFeatureToEditedFeaturesIfNotAlreadyAdded = (featureId: string) => {
    const editFeature = editSource.getFeatureById(featureId);
    const archivedFeature = archivedSource.getFeatureById(featureId);
    const feature = editFeature ?? archivedFeature;

    if (!feature) {
      return;
    }

    const featureAsGeoJson = featureToGeoJson(feature);
    const index = editedFeatures.findIndex((geoJsonFeature) => featureAsGeoJson.id === geoJsonFeature.id);
    // Hvis vi allerede har lagt inn featuren tidligere i historikken,
    // ønsker vi å overskrive den hvis den samme featuren endres senere i historikken
    if (index !== -1) {
      editedFeatures[index] = featureAsGeoJson;
      return;
    }

    editedFeatures.push(featureAsGeoJson);
  };

  const removeFeatureFromEditedFeatures = (featureId: string) => {
    editedFeatures = editedFeatures.filter((feature) => feature.id !== featureId);
  };

  relevantHistoryEntries.forEach((entry) => {
    entry.changes.forEach((change) => {
      if (change.to == null) {
        return;
      }
      addFeatureToEditedFeaturesIfNotAlreadyAdded(change.id);

      if (entry.type === "grensedeling") {
        // Grensedeling er en litt sær grense-endring siden den påvirker flere features på en gang og trenger derfor egen implementasjon
        const newFeatures = removeNil((change as HistoryChange<Feature[]>).to.map((f) => f.getId()?.toString()));
        const removedFeatures = removeNil((change as HistoryChange<Feature[]>).from.map((f) => f.getId()?.toString()));
        removedFeatures.filter(isTempFeatureId).forEach((id) => removeFeatureFromEditedFeatures(id));
        newFeatures.forEach((id) => {
          addFeatureToEditedFeaturesIfNotAlreadyAdded(id);
        });
      } else if (entry.type === "nygrense") {
        // ny grense er også sær, siden den kan inneholde 1-2 grensedelinger attåt
        if (isNyGrenseChange(change) && change.from.grensedeling != null && change.to.grensedeling != null) {
          const newFeatures = removeNil(change.to.grensedeling.map((f) => f.getId()?.toString()));
          const removedFeatures = getUniqueItems(removeNil(change.from.grensedeling.map((f) => f.getId()?.toString())));

          removedFeatures.forEach((id) => {
            if (isTempFeatureId(id)) {
              // Hvis det er en ny grense som ble delt bare fjerner vi den fra redigerte grenser
              removeFeatureFromEditedFeatures(id);
            } else {
              // Om det er en eksisterende grense som ble delt må den legges til som "til arkivering"
              addFeatureToEditedFeaturesIfNotAlreadyAdded(id);
            }
          });
          newFeatures.forEach((id) => {
            addFeatureToEditedFeaturesIfNotAlreadyAdded(id);
          });
        }
      }
    });
  });

  const nyeGrenserSomSkalSlettesId = historyToCurrentIndex
    .filter((entry) => entry.type === "grensedelete")
    .flatMap((entry) => (entry as NyGrenseDeleteEntry).changes.map((change) => change.id));
  editedFeatures = editedFeatures.filter(
    (feature) => !("id" in feature && nyeGrenserSomSkalSlettesId.includes(feature.id)),
  );

  utkastOperations.grenseendringer = {
    endredeFeatures: editedFeatures,
  };

  return utkastOperations;
};

const isNyGrenseChange = (change: unknown): change is HistoryChange<NyGrense> => {
  if (!(change instanceof Object) || !("from" in change) || !("to" in change)) {
    return false;
  }

  if (
    change.from instanceof Object &&
    "grensedeling" in change.from &&
    change.from.grensedeling != null &&
    change.to instanceof Object &&
    "grensedeling" in change.to &&
    change.to.grensedeling != null
  ) {
    return true;
  }
  return false;
};
export const toCleanUtkast = (utkastToClean: OppdaterUtkastRequest): OppdaterUtkastRequest => {
  const utkastCopy = structuredClone(utkastToClean);
  const featureIsNotAnArchivedNewFeature = (feature: GeoJSONFeature): boolean =>
    !(isTempFeatureId(feature.id) && feature.properties.shouldArchive === true);

  // Nye features som har blitt arkivert kan vi bare filtrere bort
  const endredeFeatures = utkastCopy.operasjoner.grenseendringer.endredeFeatures.filter(
    featureIsNotAnArchivedNewFeature,
  );

  // Fjerner midlertidige ID fra alle nye grenser og deres dokumentasjonsreferanser, da dette ikke er forventet fra backend
  endredeFeatures.forEach((endretFeature) => {
    if (endretFeature.id != null && isTempFeatureId(endretFeature.id)) {
      endretFeature.id = undefined;
    }

    const properties = endretFeature.properties as FeatureProperties;
    const metadata = properties.metadata as Metadata;

    metadata.dokumentasjonsreferanser?.forEach((dokref) => {
      if (isTempDokrefId(dokref.id)) {
        dokref.id = undefined;
      }
    });
  });

  utkastCopy.operasjoner.grenseendringer.endredeFeatures = endredeFeatures;
  return utkastCopy;
};

export const addTempFeatureIdToNewFeaturesInUtkast = (utkast: UtkastResponse): UtkastResponse => {
  const utkastCopy = structuredClone(utkast);

  const endredeFeatures = utkastCopy.operasjoner.grenseendringer.endredeFeatures;

  endredeFeatures
    .filter((feature) => feature.id == null)
    .forEach((feature) => {
      feature.id = getTempFeatureId();
    });

  return utkastCopy;
};

export const createUtkastOperations = ({
  endredeFeatures = [],
  fylkesendringer = {},
  grunnkretsendringer = {},
  kommuneendringer = {},
  nasjonsendringer = {},
  stemmekretsendringer = {},
  stemmekretssammenslaaingsendringer,
  kretsDelingEndringer = [],
}: {
  endredeFeatures?: GeoJSONFeature[];
  fylkesendringer?: Record<string, FylkeRequest>;
  grunnkretsendringer?: Record<string, GrunnkretsRequest>;
  kommuneendringer?: Record<string, KommuneRequest>;
  nasjonsendringer?: Record<string, NasjonRequest>;
  stemmekretsendringer?: Record<string, StemmekretsRequest>;
  stemmekretssammenslaaingsendringer?: StemmekretsSammenslaaingsendringRequest;
  kretsDelingEndringer?: KretsDelingEndringRequest[];
}): UtkastOperasjoner => ({
  grenseendringer: {
    endredeFeatures,
  },
  metadataendringer: {
    fylkesendringer,
    grunnkretsendringer,
    kommuneendringer,
    nasjonsendringer,
    stemmekretsendringer,
  },
  stemmekretsSammenslaaingsendring: stemmekretssammenslaaingsendringer,
  kretsDelingEndringer: kretsDelingEndringer,
});
