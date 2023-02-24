import { Feature } from "ol";
import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import LineString from "ol/geom/LineString";
import { EntityUtkastType, UtkastEntity, ResponseWithId } from "./types";
import {
  GrenseEntry,
  GrunnkretsEntry,
  MetadataEntry,
  StemmekretsEntry,
  StemmekretsSammenslaaingsendringEntry,
  ToolbarHistory,
} from "contexts/ToolbarContext";
import { editSource } from "hooks/layers/constants";
import {
  FylkeRequest,
  GrunnkretsRequest,
  KommuneRequest,
  NasjonRequest,
  StemmekretsRef,
  StemmekretsRequest,
  StemmekretsSammenslaaingsendringRequest,
  UtkastGrenseendringer,
  UtkastMetadataendringer,
  UtkastOperasjoner,
  UtkastResponse,
} from "types/api";
import { featureToGeoJson } from "utils/map/geoJson";
import { getIdFromEntity } from "utils/api";

const getCombinedEntity = <T extends ResponseWithId>(
  entity: T,
  utkastSlice: NonNullable<
    NonNullable<UtkastMetadataendringer>[EntityUtkastType]
  >
) => {
  const utkastForEntity = utkastSlice[getIdFromEntity(entity)];

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

const getCombinedFeatures = (
  featureCollection: GeoJSONFeatureCollection,
  featuresSlice: NonNullable<UtkastGrenseendringer["endredeFeatures"]>
) => {
  return featureCollection.features.map(
    (feature: GeoJSONFeature) => featuresSlice[feature.id] ?? feature
  );
};

export const applyNonFeatureUtkast = <T extends NonNullable<UtkastEntity>>(
  entity: T,
  utkast: UtkastResponse,
  type: EntityUtkastType
) => {
  const utkastSlice = utkast.operasjoner.metadataendringer?.[type];

  if (!utkastSlice) return entity;

  if (Array.isArray(entity) && type === "stemmekretsendringer") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    return entity.map((e) => {
      const utkastForEntity =
        utkast.operasjoner.metadataendringer?.[type]?.[getIdFromEntity(e)];

      return {
        ...e,
        ...utkastForEntity,
        navn: utkastForEntity?.stemmekretsnavn ?? (e as StemmekretsRef).navn,
      };
    });
  } else if (Array.isArray(entity)) {
    return entity.map((e) => getCombinedEntity(e, utkastSlice));
  }

  return getCombinedEntity(entity, utkastSlice);
};

export const applyFeatureUtkast = (
  featureCollection: GeoJSONFeatureCollection,
  utkast: UtkastResponse
) => {
  const featuresSlice = utkast.operasjoner.grenseendringer?.endredeFeatures;

  if (!featuresSlice) return featureCollection;

  const newFeatures = getCombinedFeatures(featureCollection, featuresSlice);

  return {
    ...featureCollection,
    features: newFeatures,
  };
};

const reduceMetadataOperations = (
  utkastOperations: UtkastOperasjoner,
  entry: GrunnkretsEntry | StemmekretsEntry
) => {
  switch (entry.type) {
    case "grunnkrets": {
      return addKretsChangeToOperations(
        utkastOperations,
        entry,
        "grunnkretsendringer"
      );
    }
    case "stemmekrets": {
      return addKretsChangeToOperations(
        utkastOperations,
        entry,
        "stemmekretsendringer"
      );
    }
  }
};

const reduceGrenseOperations = (
  editedFeatures: Record<string, GeoJSONFeature>,
  entry: GrenseEntry | MetadataEntry
) => {
  entry.changes.forEach((change) => {
    if (!change.to) return editedFeatures;

    const feature = editSource.getFeatureById(change.id) as Feature<LineString>;

    const featureId = feature.getId();

    if (!featureId) return editedFeatures;

    editedFeatures[featureId] = featureToGeoJson(feature);
  });

  return editedFeatures;
};

//TO DO: Her må jeg fikse sånn at det legges til informasjon til StemmekretsRequest
//Må legge til flere felter i StemmeRequest
//Må nok ikke det likevel, alt ligger i stemmekretssammenslaingsendringentry!!
const reduceStemmekretssammenslaingsOperations = (
  stemmekretssammenslaaingsOperations: StemmekretsSammenslaaingsendringRequest,
  entry: StemmekretsSammenslaaingsendringEntry
) => {
  stemmekretssammenslaaingsOperations.stemmekretsnavn = entr;

  return addStemmekretsammenslaaingToOperations(
    stemmekretssammenslaaingsOperations,
    entry
  );
};

const addKretsChangeToOperations = (
  stemmekretssammenslaaingsOperations: UtkastOperasjoner,
  entry: GrunnkretsEntry | StemmekretsEntry,
  endringerKey: "grunnkretsendringer" | "stemmekretsendringer"
) => {
  entry.changes.forEach((change) => {
    if (
      change.to &&
      stemmekretssammenslaaingsOperations.metadataendringer[endringerKey]
    ) {
      stemmekretssammenslaaingsOperations.metadataendringer[endringerKey][
        change.id
      ] = change.to;
    }
  });

  return stemmekretssammenslaaingsOperations;
};

// const addStemmekretsammenslaaingToOperations = (
//   stemmekretssammenslaaingsOperations: StemmekretsRequest,
//   entry: StemmekretsSammenslaaingsendringEntry
// ) => {
//   entry.changes.forEach((change) => {
//     if (
//       change.to &&
//       stemmekretssammenslaaingsOperations.stemmekretsSammenslaaingsendring
//     ) {
//       stemmekretssammenslaaingsOperations.stemmekretsSammenslaaingsendring =
//         change.to;
//     }
//   });

//   return stemmekretssammenslaaingsOperations;
// };

export const historyToUtkastOperations = (
  history: ToolbarHistory,
  previousUtkast?: UtkastResponse
) => {
  const historyToCurrentIndex = history.entries.slice(0, history.index);

  // hent endringer på enheter og gjør endringene om til utkastoperasjoner
  const utkastOperations = (
    historyToCurrentIndex.filter(
      (entry) => entry.type === "stemmekrets" || entry.type === "grunnkrets"
    ) as (GrunnkretsEntry | StemmekretsEntry)[]
  ).reduce(
    reduceMetadataOperations,
    createUtkastOperations({
      ...{
        ...previousUtkast?.operasjoner.grenseendringer,
        ...previousUtkast?.operasjoner.metadataendringer,
      },
    })
  ) as UtkastOperasjoner;

  //TO DO: hent endringer på sammenslåinger av stemmekretser og gjør om til utkastoperasjoner
  //her må jeg gjøre noe på utkastOperations.stemmekretsSammenslaaingsendring
  //hvorfor blir typen her feil?
  // const sammenslaaingsOperations = (
  //   historyToCurrentIndex.filter(
  //     (entry) => entry.type === "stemmekretssammenslaaing"
  //   ) as StemmekretsSammenslaaingsendringEntry[]
  // ).reduce(
  //   reduceStemmekretssammenslaingsOperations,
  //   createUtkastOperations({
  //     ...{
  //       ...previousUtkast?.operasjoner.stemmekretsSammenslaaingsendring,
  //     },
  //   })
  // ) as UtkastOperasjoner;

  // Sånn jeg har fortstått det så er meningen med denne funksjonen at man skal få
  //Hmm litt utfordrende hvordan logikken skal bli her
  const sammenslaaingsOperations = (
    historyToCurrentIndex.filter(
      (entry) => entry.type === "stemmekretssammenslaaingsendring"
    ) as StemmekretsSammenslaaingsendringEntry[]
  ).reduce(
    reduceStemmekretssammenslaingsOperations,
    {} as StemmekretsRequest /* Må ha en type her men vet ikke helt hva det skal være hmm*/
  );
  // ).reduce(
  //   reduceStemmekretssammenslaingsOperations,
  //   {} as StemmekretsSammenslaaingsendringRequest
  // );

  //Her må jeg legge til sammenslåinger i utkastOperations
  if (Object.keys(sammenslaaingsOperations).length > 0) {
    utkastOperations.stemmekretsSammenslaaingsendring;
  }

  // hent grenseendringer og gjør endringene om til en liste av features
  const editedFeatures = (
    historyToCurrentIndex.filter(
      (entry) => entry.type === "grense" || entry.type === "metadata"
    ) as (GrenseEntry | MetadataEntry)[]
  ).reduce(reduceGrenseOperations, {} as Record<string, GeoJSONFeature>);

  // hvis det er noen endringer, slå sammen tidligere endringer og nye endringer til ny liste
  if (Object.keys(editedFeatures).length > 0) {
    utkastOperations.grenseendringer = {
      endredeFeatures: {
        ...utkastOperations.grenseendringer?.endredeFeatures,
        ...editedFeatures,
      },
    };
  }

  return utkastOperations;
};

export const createUtkastOperations = ({
  endredeFeatures = {},
  fylkesendringer = {},
  grunnkretsendringer = {},
  kommuneendringer = {},
  nasjonsendringer = {},
  stemmekretsendringer = {},
  stemmekretssammenslaaingsendringer,
}: {
  endredeFeatures?: Record<string, GeoJSONFeature>;
  fylkesendringer?: Record<string, FylkeRequest>;
  grunnkretsendringer?: Record<string, GrunnkretsRequest>;
  kommuneendringer?: Record<string, KommuneRequest>;
  nasjonsendringer?: Record<string, NasjonRequest>;
  stemmekretsendringer?: Record<string, StemmekretsRequest>;
  stemmekretssammenslaaingsendringer?: StemmekretsSammenslaaingsendringRequest;
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
});
