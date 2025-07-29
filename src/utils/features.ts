import { editSource, grenserLayers } from "hooks/layers/constants";
import { GrenseType, LayerId, editableGrenseTypes, getInndelingtypeFromGrensetype } from "hooks/layers/types";
import { Feature } from "ol";
import { FeatureLike } from "ol/Feature";
import { Coordinate, equals } from "ol/coordinate";
import { Geometry, LineString } from "ol/geom";
import { previousCoordinateKey } from "pages/Kart/interactions/constants";
import { getTempFeatureId, isNonEditableFeatureId, isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { FeatureProperties, KontekstEgenskaper, Metadata, Posisjonskvalitet } from "types/api";
import { MetadataDiscriminator, getMetadataDiscriminatorFromType, isAdministrativGrense } from "./grenser";
import { removeNil } from "./list-utils";
import { getRepresentasjonspunktId } from "./map/source";
import { isGrenseType, isNotNil } from "./type-utils";

const getPosisjonskvalitetForFeature = (feature: Feature<Geometry>): Posisjonskvalitet => {
  return ((feature.getProperties() as FeatureProperties).metadata as Metadata).commonGrense?.posisjonskvalitet;
};
const validateEqualPosisjonskvaliteter = (features: Feature<Geometry>[]): boolean => {
  return (
    new Set(features.map((f) => getPosisjonskvalitetForFeature(f)?.maalemetode.id)).size === 1 &&
    new Set(features.map((f) => getPosisjonskvalitetForFeature(f)?.noeyaktighet)).size === 1
  );
};

const validateEqualGrensetyper = (features: Feature<Geometry>[]): boolean => {
  return new Set(features.map((f) => (f.getProperties() as FeatureProperties).type)).size === 1;
};

const validateCanMergeFeatures = (features: Feature<Geometry>[]): boolean => {
  return validateEqualPosisjonskvaliteter(features) && validateEqualGrensetyper(features);
};

const coordsEqual = (a: Coordinate, b: Coordinate) => a[0] === b[0] && a[1] === b[1];

// Grådig algoritme for å slå sammen features til én feature. Den forventer listen ikke inneholder branches.
const mergeUnorderedConnectedLineStrings = (features: Feature<LineString>[]) => {
  const segments = removeNil(features.map((f) => f.getGeometry()).map((g) => g?.getCoordinates()));
  if (segments.length === 0) {
    return null;
  }

  const mergedLine = [];
  mergedLine.push(...segments[0]);

  const used: boolean[] = new Array(segments.length).fill(false);
  used[0] = true;

  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 1; i < segments.length; i++) {
      if (used[i]) {
        continue;
      }

      const currentLine = segments[i];
      const currentLineStart = currentLine[0];
      const currentLineEnd = currentLine[currentLine.length - 1];
      const mergedLineStart = mergedLine[0];
      const mergedLineEnd = mergedLine[mergedLine.length - 1];

      // Legger linjestykket enten på start eller slutten av den sammenslåtte linja enten i nåværende rekkefølge eller i revers
      if (coordsEqual(currentLineStart, mergedLineEnd)) {
        mergedLine.push(...currentLine.slice(1));
        used[i] = true;
        changed = true;
        break;
      } else if (coordsEqual(currentLineEnd, mergedLineEnd)) {
        mergedLine.push(...currentLine.slice(0, -1).reverse());
        used[i] = true;
        changed = true;
        break;
      } else if (coordsEqual(currentLineEnd, mergedLineStart)) {
        mergedLine.unshift(...currentLine.slice(0, -1));
        used[i] = true;
        changed = true;
        break;
      } else if (coordsEqual(currentLineStart, mergedLineStart)) {
        mergedLine.unshift(...currentLine.slice(1).reverse());
        used[i] = true;
        changed = true;
        break;
      }
    }
  }
  // hvis vi ikke har brukt alle er linjen ikke sammenhengende og vi returnerer null
  if (used.some((u) => !u)) {
    return null;
  }
  return new Feature({ geometry: new LineString(mergedLine) });
};

export const mergeFeaturesToNewFeature = (
  features: Feature<LineString>[],
  asGrenseType: GrenseType,
): Feature<LineString> | null => {
  if (validateCanMergeFeatures(features) === false) {
    return null;
  }
  const newLineString = mergeUnorderedConnectedLineStrings(features);
  if (newLineString == null) {
    return null;
  }
  newLineString.setId(getTempFeatureId());
  newLineString.setProperties({ ...getDefaultFeatureProperties(asGrenseType) });
  return newLineString;
};

export const createDuplicateOfFeature = (feature: Feature<Geometry>, asGrenseType: GrenseType): Feature<Geometry> => {
  const duplicateFeature = feature.clone();
  duplicateFeature.setId(getTempFeatureId());
  duplicateFeature.setProperties({ ...getPropertiesForDuplicateOfFeature(feature, asGrenseType) });
  return duplicateFeature;
};

export const getPropertiesForDuplicateOfFeature = (
  originalFeature: Feature<Geometry>,
  asGrenseType: GrenseType,
): FeatureProperties | undefined => {
  const newDefaultFeatureProperties = getDefaultFeatureProperties(asGrenseType);
  if (newDefaultFeatureProperties != null) {
    if (isTeigFeature(originalFeature) === true) {
      return {
        ...newDefaultFeatureProperties,
        type: asGrenseType,
        kontekstEgenskaper: [],
      };
    } else {
      const copiedFeatureProperties = originalFeature.getProperties() as FeatureProperties;
      const newDefaultMetadata = newDefaultFeatureProperties.metadata as Metadata;
      const copiedMetadata = copiedFeatureProperties.metadata as Metadata;
      const newDefaultCommonMetadata = newDefaultMetadata.common;
      if (newDefaultCommonMetadata != null) {
        const newInheritedProperties: FeatureProperties = {
          ...newDefaultFeatureProperties,
          type: asGrenseType,
          kontekstEgenskaper: [],
          metadata: {
            ...newDefaultMetadata,
            commonGrense: copiedMetadata.commonGrense,
            common: {
              ...newDefaultCommonMetadata,
              informasjon: copiedFeatureProperties.metadata?.common?.informasjon,
              opphav: copiedFeatureProperties.metadata?.common?.opphav,
            },
          },
        };
        return newInheritedProperties;
      }
    }
    return newDefaultFeatureProperties;
  }
};

export const createDuplicateOfTeigFeature = (
  feature: Feature<Geometry>,
  asGrenseType: GrenseType,
  maalemetodeId?: string,
  noeyaktighet?: number,
): Feature<Geometry> => {
  const duplicateFeature = feature.clone();
  duplicateFeature.setId(getTempFeatureId());

  const defaultProps = getDefaultFeatureProperties(asGrenseType);
  if (defaultProps == null) {
    return duplicateFeature;
  }

  const posisjonskvalitet: Posisjonskvalitet = {
    maalemetode: { id: maalemetodeId, href: "" },
    noeyaktighet: noeyaktighet,
  };

  duplicateFeature.setProperties({
    ...defaultProps,
    type: asGrenseType,
    kontekstEgenskaper: [],
    metadata: {
      ...(defaultProps.metadata as Metadata),
      commonGrense: {
        ...((defaultProps.metadata as Metadata)?.commonGrense ?? {}),
        posisjonskvalitet,
      },
    },
  });

  return duplicateFeature;
};

export const createDuplicateOfSosiFeature = (
  feature: Feature<Geometry>,
  asGrenseType: GrenseType,
): Feature<Geometry> => {
  const duplicateFeature = feature.clone();
  duplicateFeature.setId(getTempFeatureId());

  duplicateFeature.setProperties({
    ...getDefaultFeatureProperties(asGrenseType),
  });

  return duplicateFeature;
};

export const setDefaultFeatureProperties = (feature: Feature<Geometry>, grenseType: GrenseType | undefined) => {
  if (!grenseType) {
    return;
  }

  const properties = getDefaultFeatureProperties(grenseType);
  if (!properties) {
    return;
  }

  feature.setProperties({
    ...properties,
  });
};

/**
 * Returns the first feature found which matches the featureId parameter. If not present returns null
 * @param featureId Feature to find
 * @returns Feature<Geometry> | null
 */
export const getFeatureIfExistsInAnyLayer = (featureId: string) => {
  for (const layer of Object.values(grenserLayers)) {
    const source = layer.getSource();

    if (source) {
      const feature = source.getFeatureById(featureId);

      if (feature) {
        return feature as Feature<Geometry>;
      }
    }
  }

  return null;
};

/**
 * Removes the feature from all and any layer it may exist in.
 * @param featureId Feature to remove
 * @returns Integer. The number of layers it was removed from, or -1 if none.
 */
export const removeFeatureFromAllLayers = (featureId: string) => {
  let numberOfRemoves = 0;
  for (const layer of Object.values(grenserLayers)) {
    const source = layer.getSource();

    if (source) {
      const feature = source.getFeatureById(featureId);
      if (feature) {
        source.removeFeature(feature);
        ++numberOfRemoves;
      }
    }
  }
  return numberOfRemoves > 0 ? numberOfRemoves : -1;
};

export const getFeaturesConnectedToFeatureAtEndpoints = (connectedToFeature: Feature<Geometry>) => {
  const connectedFeatures: Feature<Geometry>[] = [];
  const geometry = connectedToFeature.getGeometry();
  if (!geometry || !(geometry instanceof LineString)) {
    return [];
  }

  const firstCoordConnectedFeature = geometry.getFirstCoordinate();
  const lastCoordConnectedFeature = geometry.getLastCoordinate();

  for (const layer of Object.values(grenserLayers)) {
    const source = layer.getSource();

    if (!source) {
      continue;
    }

    for (const feature of source.getFeatures()) {
      if (feature.getId() !== connectedToFeature.getId()) {
        const featureToCheckGeometry = feature.getGeometry();
        if (featureToCheckGeometry instanceof LineString) {
          const firstCoordFeatureToCheck = featureToCheckGeometry.getFirstCoordinate();
          const lastCoordFeatureToCheck = featureToCheckGeometry.getLastCoordinate();

          if (
            equals(firstCoordConnectedFeature, firstCoordFeatureToCheck) ||
            equals(firstCoordConnectedFeature, lastCoordFeatureToCheck) ||
            equals(lastCoordConnectedFeature, firstCoordFeatureToCheck) ||
            equals(lastCoordConnectedFeature, lastCoordFeatureToCheck)
          ) {
            connectedFeatures.push(feature);
          }
        }
      }
    }
  }

  return connectedFeatures;
};

export const getAllFeatureEndPointCoordinates = (layerIdsToFilter: LayerId[]): (FeatureIdWithEndpoints | null)[] => {
  return Object.entries(grenserLayers)
    .flatMap(([key, layer]) => {
      if (layerIdsToFilter.includes(key as LayerId)) {
        return [];
      }

      const source = layer.getSource();
      if (source) {
        return source.getFeatures();
      }

      return [];
    })
    .flatMap((f) => {
      const geom = f.getGeometry();
      const id = f.getId()?.toString();
      if (geom && geom instanceof LineString && id != null) {
        return { featureId: id, endpoints: { first: geom.getFirstCoordinate(), last: geom.getLastCoordinate() } };
      }

      return null;
    });
};

export type FeatureIdWithEndpoints = {
  featureId: string;
  endpoints: {
    first: Coordinate;
    last: Coordinate;
  };
};

/** Tar inn en grense og prøver å avgjøre om den er koblet til andre grenser i begge ender */
export const isFeatureDeadEnd = (feature: Feature<Geometry>, allFeatureEndpoints: FeatureIdWithEndpoints[]) => {
  const geometry = feature.getGeometry() as LineString;
  const coordinates = geometry?.getCoordinates() as Coordinate[];

  const head = coordinates[0];
  const tail = coordinates[coordinates.length - 1];

  if (equals(head, tail)) {
    return false;
  }

  const featureEndpointsToCheck = allFeatureEndpoints.filter(
    (featureEndpoint) => featureEndpoint.featureId !== feature.getId()?.toString(),
  );
  const isHeadConnected = featureEndpointsToCheck.find(
    (featureEndPoint) => equals(featureEndPoint.endpoints.first, head) || equals(featureEndPoint.endpoints.last, head),
  );
  const isTailConnected = featureEndpointsToCheck.find(
    (featureEndPoint) => equals(featureEndPoint.endpoints.first, tail) || equals(featureEndPoint.endpoints.last, tail),
  );
  return !(isHeadConnected && isTailConnected);
};

const getDefaultFeatureMetadata = (discriminator: MetadataDiscriminator): Metadata => {
  return {
    discriminator: discriminator,
    common: {
      gyldigFra: new Date().toISOString(),
      identifikasjon: {
        lokalid: "NotARealID",
      },
      sporingsinformasjon: {
        oppdateringsdato: new Date().toISOString(),
      },
      datafangstdato: "",
    },
    commonGrense: {},
    dokumentasjonsreferanser: [],
  };
};

export const getDefaultFeatureProperties = (grenseType: GrenseType): FeatureProperties | null => {
  const metadataDiscriminator = getMetadataDiscriminatorFromType(grenseType);
  const inndelingtype = getInndelingtypeFromGrensetype(grenseType);

  if (!metadataDiscriminator || !inndelingtype) {
    return null;
  }

  const metadata: Metadata = getDefaultFeatureMetadata(metadataDiscriminator);

  const properties: FeatureProperties = {
    inndelingerKontekst: {
      // Burde sette ID her fra noe? Vet ikke hvordan man kan hente ut inndelingskonteksten automatisk
      id: "",
      type: inndelingtype,
    },
    kontekstEgenskaper: [],
    shouldArchive: false,
    srid: 25833,
    type: grenseType,
    version: 1,
    metadata: metadata,
  };

  return properties;
};

export const isFeatureEditable = (
  feature: FeatureLike,
  isArchived = false,
  requireAllContextsVisible: boolean = true,
) => {
  if (isNonEditableFeatureId(feature.getId())) {
    return false;
  }

  const isMetadataEditable = isFeatureMetadataEditable(feature, isArchived);

  const featureType = feature.get("type");

  if (isGrenseType(featureType) && isAdministrativGrense(featureType) && requireAllContextsVisible) {
    if (isTempFeatureId(feature.getId())) {
      return true;
    }

    const properties = feature.getProperties() as FeatureProperties;
    const kontekstEgenskaper = properties.kontekstEgenskaper as KontekstEgenskaper[];

    if (kontekstEgenskaper.length === 0) {
      return false;
    }

    const layerSources = Object.values(grenserLayers)
      .map((layer) => layer.getSource())
      .filter(isNotNil);

    // Kontekstegenskaper inneholder hvilke kretser som grensen tilhører (f. eks stemme/grunnkrets)
    // Alle disse kretsene må være synlige for at en administrativ grense skal være synlig
    // Vi kan sjekke gjennom alle layer sources for å se om lokalIDen til representasjonspunktet er tilgjengelig som en feature.
    // Dersom den er tilgjengelig, kan vi anta at kretsen er synlig
    const alleKretserIKontekstEgenskaperErSynlig = kontekstEgenskaper.every((egenskap) => {
      const lokalId = egenskap.id?.lokalid.value;
      if (lokalId === undefined) {
        return false;
      }

      // TODO Velge riktig layerSource basert på kontekstegenskaptype?
      return layerSources.some((source) => source.getFeatureById(getRepresentasjonspunktId(lokalId)) !== null);
    });

    if (!alleKretserIKontekstEgenskaperErSynlig) {
      return false;
    }
  }

  return isMetadataEditable;
};

export const isFeatureMetadataEditable = (feature: FeatureLike, isArchived: boolean) => {
  const featureType = feature.get("type");
  const isEditableFeatureType = isGrenseType(featureType) && editableGrenseTypes.includes(featureType);
  return isEditableFeatureType && !isArchived;
};

export const isPreviousAndCurrentCoordinatesEqual = (feature: Feature<LineString>) => {
  const previousFeatureCoordinates = feature.get(previousCoordinateKey) as Coordinate[] | undefined;
  const currentFeatureCoordinates = feature.getGeometry()?.getCoordinates();

  if (previousFeatureCoordinates && currentFeatureCoordinates) {
    for (let i = 0; i < previousFeatureCoordinates.length; i++) {
      if (equals(previousFeatureCoordinates[i], currentFeatureCoordinates[i])) {
        continue;
      }

      return false;
    }
  }
  return true;
};

export const isTeigFeature = (feature: FeatureLike) => {
  const featureId = feature.getId()?.toString();

  if (featureId != null) {
    if (featureId.includes("TEIGGRENSEWFS")) {
      return true;
    }
    if (featureId.includes("M22AdministrativeGrenser")) {
      return true;
    }
  }

  return false;
};

export const isSosiFeature = (feature: FeatureLike) => {
  return feature.get("type").toString().startsWith("SOSI");
};

export const isFeatureToBeArchived = (feature: FeatureLike): boolean => feature.get("shouldArchive") ?? false;

export const getFeatureFremtidigEndringDato = (feature: FeatureLike | undefined) => {
  if (feature) {
    const properties = feature.getProperties() as FeatureProperties | undefined;
    if (!properties) {
      return;
    }

    const metadata = properties.metadata as Metadata | undefined;

    return metadata?.common?.gyldigTil;
  }
};

export const getInndelingFremtidigEndringDato = (inndelingId: string) => {
  return getFeatureIfExistsInAnyLayer(getRepresentasjonspunktId(inndelingId))?.get("gyldigTil") as string | undefined;
};

export const getFlateRepresentasjonpunkterWithFremtidigEndring = (feature: FeatureLike) => {
  const properties = feature.getProperties() as FeatureProperties | undefined;
  if (!properties) {
    return [];
  }

  const relevantRepresentasjonspunkter = removeNil(
    properties.kontekstEgenskaper.map((kontekstEgenskap) =>
      editSource.getFeatureById(getRepresentasjonspunktId(kontekstEgenskap.id?.lokalid.value ?? "")),
    ),
  ).filter((punkt) => {
    const gyldigTil = punkt.get("gyldigTil") as string | undefined;

    return gyldigTil != null;
  });

  return relevantRepresentasjonspunkter;
};

export const anyFeatureIsEditable = (): boolean => {
  return editSource.getFeatures().some((feature) => isFeatureEditable(feature));
};
